import { LightningElement,wire,track } from 'lwc';
import {NavigationMixin} from 'lightning/navigation';
import INVOICE_OBJECT from '@salesforce/schema/Invoice__c';
import getInvoices from '@salesforce/apex/InvoiceController.getInvoices';
import deleteRecord from '@salesforce/apex/InvoiceController.deleteRecord';
import {refreshApex} from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const actions = [
  { label: 'View', name: 'view' },
  { label: 'Delete', name: 'delete' },
];
export default class IMS_InvoiceList extends NavigationMixin (LightningElement)  {

    @track invoiceData;
    @track errorinvoiceData;  
    
    @track columnTable =[
        {label: 'Invoice Name', fieldName: 'Name', type: 'button',
        typeAttributes: { label: { fieldName: 'Name' }, name:'urlredirect', variant:'base' } },
        {label:'Company',fieldName:'CompanyName',type :'text'},
        {label:'Bill To Contact',fieldName:'ContactName',type :'text'},
        {label:'Status',fieldName:'Status__c'},
        {label:'Invoice Date',fieldName:'InvoiceDate__c',type:'Date'},
        {label:'Due Date',fieldName:'Due_Date__c',type:'Date'}, 
        {label: 'Action',
        type: 'action',
        initialWidth:'50px',
        typeAttributes: { rowActions: actions },
    },  
    ];

    wiredInvoiceResult;

    @wire(getInvoices)
    
    dataTableInv(result){
        this.wiredInvoiceResult=result;
         if(result.data){
          this.invoiceData=result.data.map((invoice)=>({
            ...invoice,
            CompanyName: invoice.Company__r.Name,
            ContactName: invoice.Contact__r.Name,
            
          }));
           this.errorinvoiceData = undefined;   
        }
        else if(result.error){
          this.errorinvoiceData = result.error;  
          this.invoiceData=undefined;
          this.showToast('Error','An Error occured while fetching invoices','error');
        }

    }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;
    const recordId = event.detail.row.Id;
    switch (actionName) {
      case 'view':
        this.viewCurrentRecord(row);
        break;
      case 'delete':
        deleteRecord({ recordId: row.Id })
          .then(() => {
            this.showToast('Success', 'Invoice deleted successfully', 'success');
            return refreshApex(this.wiredInvoiceResult);
          })
          .catch((error) => {
            console.error('Error deleting invoice:', error);
          });
        break;
     default:

      this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
          recordId: recordId,
          objectApiName: INVOICE_OBJECT.objectApiName,
          actionName: 'view'
        }
      });
      break;
    }
  }

  viewCurrentRecord(currentRow) {
    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: currentRow.Id,
            actionName: 'view'
        }
    }); 
}

  showToast(title, message, variant) {
      const event = new ShowToastEvent({
          title: title,
          message: message,
          variant: variant,
          mode: 'dismissable'
      });
      this.dispatchEvent(event);
  }

  
}