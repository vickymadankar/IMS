import { LightningElement, api, track, wire } from 'lwc';
import { publish,subscribe,unsubscribe,MessageContext,createMessageContext,releaseMessageContext } from 'lightning/messageService';
import IMSChannel from '@salesforce/messageChannel/IMSChannel__c';
import searchContactss from '@salesforce/apex/InvoiceController.searchContactss';

export default class IMS_ShowContactDetails extends LightningElement {

    @wire(MessageContext)
    messageContext;  

    @track showError=false;

    selectedIconName = "standard:record";
    recordsList = [];
    selectedRecordName;
    objectApiName = "Contact";
    fieldApiName = "Name";
    searchString = "";
    selectedRecordId = "";
    selectedRecordEmail = "";
    selectedRecordAddress = "";
    
    get showRecentRecords() {
        if (!this.recordsList) {
            return false;
        }
        return this.recordsList.length > 0;
    }

    fetchSobjectRecords() {
        searchContactss({
            objectApiName: this.objectApiName,
            fieldApiName: this.fieldApiName,
            searchString: this.searchString,
        }).then(result => {
            if (result) {
                this.recordsList = result;
                console.log(this.recordsList);
            } else {
                this.recordsList = [];
            }
        }).catch(error => {
            console.log(error);
        })
    }

    get isValueSelected() {
        return this.selectedRecordId;
    }
    
    handleChange(event) {
        this.searchString = event.target.value;
        this.fetchSobjectRecords();
    } 

    handleCommit() {
        this.selectedRecordId = "";
        this.selectedRecordName = "";
    }
    
    handleSelect(event) {
        let selectedRecord = {
            name: event.currentTarget.dataset.name,
            id: event.currentTarget.dataset.id,
            email: event.currentTarget.dataset.email,
            mailingAddress: event.currentTarget.dataset.address
        };
        this.selectedRecordId = selectedRecord.id;
        console.log(selectedRecord.id);
        this.selectedRecordName = selectedRecord.name;
        this.selectedRecordEmail = selectedRecord.email;
        console.log(selectedRecord.mailingAddress);
        this.selectedRecordAddress = selectedRecord.mailingAddress;
        this.recordsList = [];
        this.showError=false;

        const payload = {id : this.selectedRecordId};
        publish(this.messageContext, IMSChannel, payload);
    }


    handleBlur(){
        if(! this.selectedRecord){
         this.showError=true;
        } else {
         this.showError=false;
        }
     }
 
     handleFocus(){
       this.showError=false;
     }
 
}