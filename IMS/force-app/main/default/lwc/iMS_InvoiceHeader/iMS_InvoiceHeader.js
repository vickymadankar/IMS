import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import hasPaymentRecord from '@salesforce/apex/InvoiceController.hasPaymentRecord';
import hasLineRecord from '@salesforce/apex/InvoiceController.hasLineRecord';
import STATUS_FIELD from '@salesforce/schema/Invoice__c.Status__c';

export default class IMS_InvoiceHeader extends LightningElement {


  @api recordId;
  @track disableRefundButton = true;
  @track disablePaymentButton = true;
  @track isRefundModalOpen = false;
  @track isPaymentModalOpen = false;

  openRefundModal() {
    this.isRefundModalOpen = true;
  }

  openPaymentModal() {
    this.isPaymentModalOpen = true;
  }

  closeModal() {
    this.isRefundModalOpen = false;
    this.isPaymentModalOpen = false;
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
      location.reload();
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
  wiredInvoice({ error, data }) {
    if (data) {
      const statusValue = getFieldValue(data, STATUS_FIELD);
      this.disablePaymentButton = statusValue !== 'Approved';
    } else if (error) {
      console.error(error);
    }
  }

   

  connectedCallback() {
    if (this.recordId) {
      this.checkPaymentRecord(this.recordId);
      this.checkLineRecord(this.recordId);
    }
  }

  checkPaymentRecord(invId) {
    hasPaymentRecord({ invId })
      .then(result => {
        console.log('Payment record Exists:', result);
        this.disableRefundButton = !result;
      })
      .catch(error => {
        console.error(error);
      });
  }

  checkLineRecord(invLineId) {
    hasLineRecord({ invLineId })
      .then(result => {
        console.log('Line record Exists:', result);
        this.disablePaymentButton = !result;
      })
      .catch(error => {
        console.error(error);
      });
  }


}