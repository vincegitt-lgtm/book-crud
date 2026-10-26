import { Component, ViewChild } from '@angular/core';
import { IonModal, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, deleteDoc, updateDoc, doc } from 'firebase/firestore';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);
const booksCol = collection(db, 'books');

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false // <--- CRITICAL FIX
})
export class Tab2Page {
  books: any[] = [];
  filteredBooks: any[] = [];
  searchTerm = '';
  selectedGenre = 'All';
  editBook: any = null;

  @ViewChild('editModal') editModal!: IonModal;

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ionViewWillEnter() {
    this.subscribeToBooks();
  }

  subscribeToBooks() {
    // Nilagyan natin ng : any ang snapshot at d para hindi mag-error sa TypeScript
    onSnapshot(booksCol, (snapshot: any) => {
      this.books = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      this.applyFilter();
    });
  }

  applyFilter() {
    this.filteredBooks = this.books.filter(b => {
      const matchesGenre = this.selectedGenre === 'All' || b.genre === this.selectedGenre;
      const term = this.searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        b.title?.toLowerCase().includes(term) ||
        b.author?.toLowerCase().includes(term);
      return matchesGenre && matchesSearch;
    });
  }

  onGenreChange(ev: any) {
    this.selectedGenre = ev.detail.value;
    this.applyFilter();
  }

  onSearch(ev: any) {
    this.searchTerm = ev.detail.value || '';
    this.applyFilter();
  }

  doRefresh(ev: any) {
    setTimeout(() => ev.target.complete(), 800);
  }

  async deleteBook(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Book',
      message: 'Are you sure you want to delete this book?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Deleting...' });
            await loading.present();
            await deleteDoc(doc(db, 'books', id));
            await loading.dismiss();
            const t = await this.toastCtrl.create({ message: 'Book deleted', duration: 2000, color: 'success' });
            t.present();
          }
        }
      ]
    });
    await alert.present();
  }

  openEdit(book: any) {
    this.editBook = { ...book };
    this.editModal.present();
  }

  async saveEdit() {
    if (!this.editBook) return;
    const loading = await this.loadingCtrl.create({ message: 'Updating...' });
    await loading.present();
    const ref = doc(db, 'books', this.editBook.id);
    await updateDoc(ref, {
      title: this.editBook.title,
      author: this.editBook.author,
      genre: this.editBook.genre,
      year: this.editBook.year,
      status: this.editBook.status
    });
    await loading.dismiss();
    this.editModal.dismiss();
    const t = await this.toastCtrl.create({ message: 'Book updated', duration: 2000, color: 'success' });
    t.present();
  }

  closeEdit() {
    this.editModal.dismiss();
  }
}