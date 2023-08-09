import { LightningElement, track,wire } from 'lwc';
import getAll from '@salesforce/apex/AccountController.getAll';
//import getAccountWithContact from '@salesforce/apex/AccountController.getAccountWithContact';


export default class SampleExample extends LightningElement {
   // @wire(getAccountWithContact) wrapperList;

   // @track isLoaded = false;
   //@track fileInput;
   //@track parsedData;

   @track displayText;
   @track address;
    @track accounts;
    @track error;

    connectedCallback() {
        this.bulava();
    }
 
    async bulava() {
        try {
            this.accounts = await getAll();
            const value = await this.promiseFunction();
            console.log('2nd then executes after 3 seconds async, value:' + value);
        } catch (error) {
            this.error = error;
        } finally {
           // this.isLoaded = true;
        }
    }

    promiseFunction() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('foo');
            }, 3000);
        });
    }

    async getDogs() {
        const response = await fetch('https://dog.ceo/api/breeds/image/random');
        const data= await response.json();
        let img = document.createElement('img');
        img.src = data.message;//message is a property in JSON response which consists URL
        this.address= data.message;
        this.template.querySelector('.container').appendChild(img);
        //wait 3 seconds 
        await new Promise((resolve, reject) => setTimeout(resolve, 3000));
        img.remove();
        //wait for 1 sec to clear address
        await new Promise((resolve, reject) => setTimeout(resolve, 1000));
        this.address='';
    }  
    
    async clearLogAfterDisplay() {
        let response = await fetch('/article/promise-chaining/user.json');
        let user = await response.json();
        console.log(user);//displays username and admin from above address
        // wait 3 seconds
        await new Promise((resolve, reject) => setTimeout(resolve, 3000));
        console.clear(); //console gets cleared after 3 seconds
    }

    async handleChange (event){
        this.displayText=event.target.value;
        await new Promise((resolve)=> setTimeout(resolve,
        4000));
        this.displayText='';
    }
}