import { LightningElement, track, wire, api } from 'lwc';
import getInvoiceLines from '@salesforce/apex/IMS_InvoiceLineItemController.getInvoiceLines';
import displayInvoiceRecord from '@salesforce/apex/InvoiceController.displayInvoiceRecord';
import getPayments from '@salesforce/apex/InvoiceController.getPayments';
import getRefunds from '@salesforce/apex/InvoiceController.getRefunds';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import STATUS_FIELD from '@salesforce/schema/Invoice__c.Status__c';

export default class IMS_InvoiceDetails extends LightningElement {

    @api recordId;
    @track recordId;

    @track disableLineButton = true;
    @track isLineModalOpen = false;

    @wire(displayInvoiceRecord,{currentId: '$recordId'}) displayInvoiceRecord;

    @wire(getInvoiceLines, { invoiceId: '$recordId' }) getLines;

    @wire(getPayments, { paymentInvoiceId: '$recordId' }) getPayments;

    @wire(getRefunds, { refundinvoiceId: '$recordId' }) getRefunds;


    handleInvlDelete(event) {
        const deletedItemId = event.target.value;
        deleteRecord(deletedItemId)
            .then(() => {
                const toastEvent = new ShowToastEvent({
                    title: 'Record Deleted',
                    message: 'Record deleted successfully',
                    variant: 'success',
                })
                this.dispatchEvent(toastEvent);
                this.getLines.data=this.getLines.data.filter(invlItem => invlItem.Id !== deletedItemId);
                return Promise.all([refreshApex(this.getLines),refreshApex(this.displayInvoiceRecord)]);
                
            })
            .catch(error => {
                window.console.log('Unable to delete record due to ' + error.body.message);
            });
    }

    handlePaymentDelete(event) {
        const deletedItemId = event.target.value;
        deleteRecord(deletedItemId)
            .then(() => {
                const toastEvent = new ShowToastEvent({
                    title: 'Record Deleted',
                    message: 'Record deleted successfully',
                    variant: 'success',
                })
                this.dispatchEvent(toastEvent);
                this.getPayments.data=this.getPayments.data.filter(payment => payment.Id !== deletedItemId);
                return Promise.all([refreshApex(this.getPayments),refreshApex(this.displayInvoiceRecord)]);
            })
            .catch(error => {
                window.console.log('Unable to delete record due to ' + error.body.message);
            });
    }

    handleRefundDelete(event) {
        const deletedItemId = event.target.value;
        deleteRecord(deletedItemId)
            .then(() => {
                const toastEvent = new ShowToastEvent({
                    title: 'Record Deleted',
                    message: 'Record deleted successfully',
                    variant: 'success',
                })
                this.dispatchEvent(toastEvent);
                this.getRefunds.data=this.getRefunds.data.filter(refund => refund.Id !== deletedItemId);    
                return Promise.all([refreshApex(this.getRefunds),refreshApex(this.displayInvoiceRecord)]);
            })
            .catch(error => {
                window.console.log('Unable to delete record due to ' + error.body.message);
            });
    }

    openLineModal() {
        this.isLineModalOpen = true;
    }

    closeModal() {
        this.isLineModalOpen = false;
    }

    handleSubmit(event) {
        event.preventDefault();        
        let fields = event.detail.fields;
        console.log('Fields are '+ JSON.stringify( fields ) );
        this.template.querySelector( 'lightning-record-edit-form' ).submit( fields );
    }
    handleSuccess(event) {
        console.log('onsuccess event recordEditForm', event.detail.id);
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Record created successfully',
                variant: 'success',
            }),
        );
        this.handleReset();
        return Promise.all([refreshApex(this.getLines),refreshApex(this.displayInvoiceRecord)]);
        
    }
  
    handleReset() {
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if ( inputFields ) {
            inputFields.forEach( field => {
                field.reset();
            } );
        }
    }


    @wire(getRecord, {
        recordId: '$recordId',
        fields: [STATUS_FIELD],
    })
    wiredInvoice({error, data}) {
        if(data){
            const statusValue = getFieldValue(data, STATUS_FIELD);
            this.disableLineButton = statusValue == 'Paid';
        } else if(error) {
           console.log('Error in LWC',error);
        }
    }



}