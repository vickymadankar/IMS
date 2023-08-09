import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import insertInvoiceLineItems from '@salesforce/apex/IMS_InvoiceLineItemController.insertInvoiceLineItems';
import hasInvoiceRecord from '@salesforce/apex/IMS_InvoiceLineItemController.hasInvoiceRecord';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import INVOICELI_OBJECT from '@salesforce/schema/InvoiceLineItem__c';
import PICKLIST_FIELDS from '@salesforce/schema/InvoiceLineItem__c.Tax_Type__c'


export default class IMS_InvoiceLines extends LightningElement {


    @track disableLineItem=true;

    picklistValues = [];
    @track listOfItems;
    connectedCallback() {
        this.initData();
    }
    initData() {
        let listOfItems = [];
        this.createRow(listOfItems);
        this.listOfItems = listOfItems;
    }
    createRow(listOfItems) {
        let invoiceLineItemObject = {};
        if (listOfItems.length > 0) {
            invoiceLineItemObject.index = listOfItems[listOfItems.length - 1].index + 1;
        } else {
            invoiceLineItemObject.index = 1;
        }
        invoiceLineItemObject.Invoice__c = null;
        invoiceLineItemObject.Description__c = null;
        invoiceLineItemObject.Quantity__c = null;
        invoiceLineItemObject.Amount__c = null;
        invoiceLineItemObject.Tax_Type__c = null;
        invoiceLineItemObject.Tax__c = null;
        listOfItems.push(invoiceLineItemObject);
    }
    /**
     * Adds a new row
     */
    addNewRow() {
      this.createRow(this.listOfItems);
    }
    /**
     * Removes the selected row
     */
    removeRow(event) {
        let toBeDeletedRowIndex = event.target.name;
        let listOfItems = [];
        for (let i = 0; i < this.listOfItems.length; i++) {
            let tempRecord = Object.assign({}, this.listOfItems[i]); //cloning object
            if (tempRecord.index !== toBeDeletedRowIndex) {
                listOfItems.push(tempRecord);
            }
        }
        for (let i = 0; i < listOfItems.length; i++) {
            listOfItems[i].index = i + 1;
        }
        this.listOfItems = listOfItems;
    }
    /**
     * Removes all rows
     */
    /**  removeAllRows() {
         let listOfItems = [];
         this.createRow(listOfItems);
         this.listOfItems = listOfItems;
     }
     */
    handleInputChange(event) {
        let index = event.target.dataset.id;
        let fieldName = event.target.name;
        let value = event.target.value;
        for (let i = 0; i < this.listOfItems.length; i++) {
            if (this.listOfItems[i].index === parseInt(index)) {
                this.listOfItems[i][fieldName] = value;
            }
        }
    }
    createInvoiceLineItems() {
        insertInvoiceLineItems({
            jsonOfListOfItems: JSON.stringify(this.listOfItems)
        })
            .then(data => {
                this.initData();
                let event = new ShowToastEvent({
                    message: "Invoice Line Item successfully created!",
                    variant: "success",
                    duration: 2000
                });
                this.dispatchEvent(event);
            })
            .catch(error => {
                console.log(error);
            });

    }

    @wire(getObjectInfo, { objectApiName: INVOICELI_OBJECT })

    invoiceMetadata;

    @wire(getPicklistValues, {
        recordTypeId: '$invoiceMetadata.data.defaultRecordTypeId',
        fieldApiName: PICKLIST_FIELDS,
    })
    getPicklistValuesForField({ data, error }) {
        if (error) {
            console.error(error)
        } else if (data) {
            this.picklistValues = data.values.map((option)=>({
                label:option.label,
                value:option.value
            }));
        }
    }


    @wire(hasInvoiceRecord)
     wiredhasInvoiceRecord({error,data}){
         if(data){
             console.log('Invoice record Exists:', data);
             this.disableLineItem= !data;
         } else if (error){
             console.error(error);
         }
     }

}