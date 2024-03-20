import { v4 } from 'uuid';
import file from './file.js';

export class Course {
  constructor({ title, price, img, id }) {
    this.title = title;
    this.price = price;
    this.img = img;
    this.id = id || v4();
  }

  printMe() {
    console.log(this.title, this.price, this.img);
  }

  toJSON() {
    return {
      title: this.title,
      price: this.price,
      img: this.img,
      id: this.id,
    };
  }

  async save() {
    try {
      const courses = await file.getAll('works.json');
      courses.push(this.toJSON());
      await file.writeToFile('works.json', courses);
    } catch (error) {
      throw new Error(error);
    }
  }

  static async update(course) {
    try {
      const courses = await file.getAll('works.json');
      const ind = courses.findIndex((el) => el.id === course.id);
      courses[ind] = course;
      await file.writeToFile('works.json', courses);
    } catch (error) {
      throw new Error(error);
    }
  }
}
