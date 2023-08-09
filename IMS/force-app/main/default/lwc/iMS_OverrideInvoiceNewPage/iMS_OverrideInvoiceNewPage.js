import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class IMS_OverrideInvoiceNewPage extends NavigationMixin(LightningElement) {

    navigateToAccountListView() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Account',
                actionName: 'list'
            },
            state: {
                filterName: 'Recent'
            },
        });
    }
}