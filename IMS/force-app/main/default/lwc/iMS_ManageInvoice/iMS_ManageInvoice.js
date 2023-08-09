import { LightningElement ,api, wire} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { publish,subscribe,unsubscribe,MessageContext,createMessageContext,releaseMessageContext } from 'lightning/messageService';
import IMSChannel from '@salesforce/messageChannel/IMSChannel__c';

export default class IMS_ManageInvoice extends NavigationMixin (LightningElement) {
    @wire(MessageContext)
    messageContext;  

    subscription = null;

    connectedCallback(){
        this.subscription = subscribe(
            this.messageContext,
            IMSChannel,
            (message) => this.handleDataPassing(message)
        );

    }

    customer;

    handleDataPassing(message){
        this.customer = message.id;
    }

    @api recordId;
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
                message: 'Invoice successfully created',
                variant: 'success',
            }),
        );
        this.handleReset();
    }

    handleReset() {
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if ( inputFields ) {
            inputFields.forEach( field => {
                field.reset();
            } );
        }
    }
   
}