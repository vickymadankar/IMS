public with sharing class InvoiceController {
    public InvoiceController() {}
    @AuraEnabled(cacheable=true)
    public static List<Invoice__c> getInvoices(){
        return[SELECT Name,Company__c,Contact__c,Company__r.Name,Contact__r.Name,Status__c,InvoiceDate__c,Due_Date__c 
               FROM Invoice__c Where Company__c IN (SELECT Id FROM Account) Order by Company__r.Name];
    }

    @AuraEnabled
    public static void deleteRecord(string recordId){
        Invoice__c objInvoice=[SELECT Id from Invoice__c WHERE Id=:recordId];
        delete objInvoice;
    }
    
    @AuraEnabled
    public static Id createInvoiceRecord(String invoiceNumber ,Id contact, Id company,Date invoiceDate,Date dueDate,
    String status,String reference,String comments,String fromAddress) {
        try {
            // Create a new Invoice record
            Invoice__c newInvoice = new Invoice__c(
                Invoice_Number__c = invoiceNumber,
                Contact__c= contact,
                Company__c= company,
                InvoiceDate__c = invoiceDate,
                Due_Date__c = dueDate,
                Status__c= status,
                Reference__c = reference,
                Comments__c = comments,
                FromAddress__c= fromAddress
            );
            // Insert the new Invoice record
            insert newInvoice;
            return newInvoice.Id;
        } catch (Exception ex) {
            throw new AuraHandledException('Error creating Invoice record: ' + ex.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Invoice__c> getInvoicesById(Id companyId){
        return[SELECT Name,Company__c,Company__r.Name,Contact__r.Name,Status__c,InvoiceDate__c,Due_Date__c 
               FROM Invoice__c Where Company__c=:companyId ];
    }


    @AuraEnabled(cacheable=true)
    public static Contact getContactDetails(Id contactId) {
    return [
      SELECT Name, Email, Phone ,MailingStreet,MailingCity,MailingState,MailingPostalCode
      FROM Contact
      WHERE Id = :contactId
    ];
  }

  @AuraEnabled(cacheable=true)
  public static List<Invoice__c> displayInvoiceRecord(Id currentId){
      return [Select Id,Name,TotalLineAmount__c,Tax_Amount__c,FinalAmount__c,TotalPaidAmount__c,TotalRefundAmount__c, GrandTotal__c
       From Invoice__c WHERE Id=:currentId];

  }


  @AuraEnabled(cacheable=true)
  public static List<Payment__c> getPayments(Id paymentInvoiceId){
    return [SELECT Id, Invoice__c,Amount__c,Date__c,Status__c ,Comments__c,Reference_Number__c
    FROM Payment__c WHERE Invoice__c=:paymentInvoiceId];
  }


  @AuraEnabled(cacheable=true)
  public static List<Refund__c> getRefunds(Id refundinvoiceId){
    return [SELECT Id, Invoice__c,Amount__c,Date__c,Status__c,Reason__c ,Reference_Number__c
    FROM Refund__c  WHERE Invoice__c=:refundinvoiceId];
  }

  @AuraEnabled
  public static Boolean hasPaymentRecord(Id invId){
    Integer paymentCount=[SELECT COUNT() FROM Payment__c WHERE Invoice__c=:invId];
    Boolean hasPayment =paymentCount > 0;
    return hasPayment;
  }

  @AuraEnabled
  public static Boolean hasLineRecord(Id invLineId){
    Integer lineCount=[SELECT COUNT() FROM InvoiceLineItem__c WHERE Invoice__c=:invLineId];
    Boolean hasLine =lineCount > 0;
    return hasLine;
  }

  @AuraEnabled
    public static List<SObject> searchContactss(String searchString) {
        try {
            String fieldsToQuery = 'FIND \'' + searchString + '\' IN ALL FIELDS RETURNING Contact(id,Name,Email,MailingAddress)';
            List<List<SObject>> searchResults = Search.query(fieldsToQuery);
            List<SObject> objectList = searchResults[0];
            return objectList;
        } catch (Exception err) {
            throw new AuraHandledException(err.getMessage());
        }
    }

    public static Invoice__c findInvoice(List<Invoice__c> invoices, Id invoiceId) {
      for (Invoice__c invoice : invoices) {
          if (invoice.Id == invoiceId) {
              return invoice;
          }
      }
      return null;
  }

}