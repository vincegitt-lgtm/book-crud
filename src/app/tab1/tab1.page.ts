import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { ToastController, LoadingController } from '@ionic/angular';

// Initialize Firebase
const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);
const booksCol = collection(db, 'books');

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false // <--- CRITICAL FIX PARA SA ERROR MO
})
export class Tab1Page {
  newBook = { title: '', author: '', genre: 'Fiction', year: null, status: 'Available' };

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async addBook() {
    if (!this.newBook.title || !this.newBook.author || !this.newBook.year) {
      const t = await this.toastCtrl.create({ message: 'Please fill in all fields', duration: 2000, color: 'danger' });
      t.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Saving...' });
    await loading.present();

    try {
      await addDoc(booksCol, this.newBook);
      loading.dismiss();
      
      const t = await this.toastCtrl.create({ message: 'Book added successfully!', duration: 2000, color: 'success' });
      t.present();
      
      // Reset form
      this.newBook = { title: '', author: '', genre: 'Fiction', year: null, status: 'Available' };
    } catch (e) {
      loading.dismiss();
      const t = await this.toastCtrl.create({ message: 'Error adding book', duration: 2000, color: 'danger' });
      t.present();
      console.error(e);
    }
  }
}