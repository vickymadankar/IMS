public with sharing class IMS_InvoiceLineItemController {
    public IMS_InvoiceLineItemController() {}
    
    @AuraEnabled 
    public static void insertInvoiceLineItems(String jsonOfListOfItems) {
        List<InvoiceLineItem__c> listOfItems = (List<InvoiceLineItem__c>) JSON.deserialize(jsonOfListOfItems, List<InvoiceLineItem__c>.class);
        insert listOfItems;
    }

    @AuraEnabled (cacheable=true)
    public static List<InvoiceLineItem__c> getInvoiceLines(Id invoiceId){
        List<InvoiceLineItem__c> invList= [SELECT Id, Name,Invoice__c,Invoice__r.Name,Amount__c,Quantity__c,Description__c,Tax_Type__c,Tax__c,Tax_Amount__c,TotalAmount__c
    FROM InvoiceLineItem__c WHERE Invoice__c=:invoiceId ];
    return invList;
    }

    @AuraEnabled (cacheable=true)
    public static Boolean hasInvoiceRecord(){
      Integer invoiceCount=[SELECT COUNT() FROM Invoice__c];
      Boolean hasInvoice =invoiceCount > 0;
      return hasInvoice;
    }

}