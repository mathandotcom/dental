import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { DateService } from 'src/app/shared/utility/date.service';
import { AppointmentResponse, AppointmentModel, AppointmentRequest, ReminderSmsResponse, AppointmentConfirmationResponse } from 'src/app/shared/appointment/appointment.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from 'src/app/shared/appointment/appointment.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { now } from 'jquery';
import { FlatpickrOptions } from 'ng2-flatpickr';
import * as moment from 'moment';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements AfterViewInit, OnDestroy, OnInit  {
  //@ViewChild("aptdatatable") dtElement: DataTableDirective;
  @ViewChild(DataTableDirective, {static: false})  dtElement: DataTableDirective;
  @ViewChild('appDatePicker', { static: false }) appDatePicker;
  loadDataTable: boolean = false;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  appointmentRequest: AppointmentRequest;
  appointmentConfirmationResponse: AppointmentConfirmationResponse;
  today: Date = new Date();
  appDate: Date = new Date();
  jsToday: string = formatDate(this.today, 'MM/dd/yyyy', 'en-US');
  appointmentDate: string = moment().format('MM/DD/yyyy');
  appointments: AppointmentModel[];
  errorMessage: string;
  alertType: string = 'alert-danger';

  reminderSmsResponse: ReminderSmsResponse;
  reminderResult: string;

  appMinDate: Date = new Date(moment().add(-5,'years').format());
  appDateOption: FlatpickrOptions = {
    mode: 'single',
    dateFormat: 'm/d/Y',
    defaultDate: new Date(this.appointmentDate),
    minDate: this.appMinDate,
    enableTime: false,
  };
  
  constructor(
    private dateService: DateService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private appintmentService: AppointmentService
    ) { 
    //https://stackblitz.com/edit/angular-vjosat?file=src%2Fapp%2Fapp.component.ts
    
  }

  ngOnInit(): void {
    this.dtOptions = {pagingType: 'full_numbers'};
    this.appointments = [];
    var appointmentResponse = this.route.snapshot.data.appointmentData;
    this.populateAppointmentDetails(appointmentResponse);
  }

  getAppSelected(){
    this.getAppointmentList(this.appointmentDate);
  }

  previousdate(){
    this.navigateDate('l');
  }

  nextdate(){
    this.navigateDate('r');
  }

  navigateDate(direction){
    this.appDate = (direction === 'l') ? this.dateService.navigatedate('l', this.appointmentDate) : this.dateService.navigatedate('r', this.appointmentDate);
    this.appointmentDate = formatDate(this.appDate, 'MM/dd/yyyy', 'en-US');
    this.appDatePicker.flatpickr.setDate(this.appDate, true, 'm/d/Y');
  }
  

  reloadAppointment(){
    this.appointmentDate = formatDate(this.appointmentDate, 'MM/dd/yyyy', 'en-US');
    this.getAppointmentList(this.appDate);
  }

  getAppointmentList(appDate) {
    this.appointments = [];
    console.log('Details for ' + appDate);
    //let requestdDate = formatDate(appDate, "yyyy-MM-dd", "en-US");
    let requestdDate = { apptdate: formatDate(appDate, "MM/dd/yyyy", "en-US") };
    this.appintmentService.getAppointments(requestdDate)
      .subscribe(response => {
        this.populateAppointmentDetails(response);
      }, (err) => {
        this.alertType = 'alert-danger';
        this.errorMessage = err.message;
        this.appointments = [];
        if (this.loadDataTable) this.rerender();
      });
  }

  populateAppointmentDetails(appointmentResponse) {
    this.errorMessage = '';
    this.appointments = [];
    if (appointmentResponse.status === 'false') {
      if (appointmentResponse.message !== null && appointmentResponse.message.code === "ENOTFOUND") {
        this.errorMessage = "Unable to connect to api source";
        this.alertType = 'alert-danger';
      }
      else if (appointmentResponse.message !== null || appointmentResponse.message == undefined) {
        if (appointmentResponse.message.type !== '' && appointmentResponse.message.type === "invalid-json") {
          this.errorMessage = `No appointment detail available for ${formatDate(this.appointmentDate, 'MM/dd/yyyy', 'en-US')}`;
          this.alertType = 'alert-warning';
        }
        else {
          this.errorMessage = appointmentResponse.message;
          this.alertType = 'alert-warning';
        }
      }
    }
    else {
      if (appointmentResponse.data != null && appointmentResponse.data.length > 0) {
        this.appointments = appointmentResponse.data; //[0].items;
        this.appointments.forEach(element => {
          element.displayStatus = element.smsReminderTitle ='';
          element.displayStatusColor = 'badge-secondary';
          if ((element.confirmed_on_date !== '' && element.confirmed_on_date !== null) || (element.confirmed === 21)) {
            element.confirm_status = 'Confirmed';
            element.confirmed_on_title = `Confirmed on ${element.confirmed_on_date}`;
            element.confirm_icon = 'fas fa-check status-green';
          }
          else if ((element.confirmed_on_date === '' || element.confirmed_on_date === null) && (element.isSmsSent === 1)) {
            element.confirmed_on_title = 'Reminder sent to confirm';
            element.confirm_status = '';
            element.confirm_icon = 'fas fa-adjust status-orange';
          }
          else if ((element.confirmed_on_date === '' || element.confirmed_on_date === null) && (element.status === 'Open' || element.status.toLowerCase() === 'unsheduled')) {
            element.confirmed_on_title = 'Pending confirmation';
            element.confirm_status = element.status;
            element.confirm_icon = 'fas fa-circle-notch status-purple';
          }
          else {
            element.confirmed_on_title = 'Confirmed but open';
            element.confirm_status = '';
            element.confirm_icon = 'fas fa-adjust status-orange';
          }

          if((element.aptStatus === 1 || element.aptStatus === 3 || element.aptStatus === 6) && element.isSmsSent === 1){
            element.displayStatus = element.smsSentStatus;
            element.smsReminderTitle = `Last reminder sent on ${element.dateTimeSent}`;
            element.displayStatusColor = 'badge-warning';
          }
          else if(element.isSmsSent === 0 || element.aptStatus === 5){
            element.displayStatus = element.isSmsSent === 0 ? element.smsSentStatus : element.status;
            element.displayStatusColor = 'badge-danger';
          }
          else if((element.aptStatus === 1 && element.isSmsSent !== 1)){
            element.displayStatus = element.status;
            element.displayStatusColor = 'badge-info';
          }
          else{
            element.displayStatus = element.status;
            element.displayStatusColor = 'badge-success';
          }

          if (element.email === '' || element.email === null) {
            element.task = 'Yet to collect email id';
          }

          if (element.cell === '' || element.cell === null) {
            element.task = 'Yet to collect contact number';
          }

        });
      }
    }
    if (this.loadDataTable) this.rerender();
    this.loadDataTable = true;
  }
  
  sendReminder(appointment: AppointmentModel, messageMode){
    appointment.isSmsSent = -1;
    appointment.displayStatus = "Sending text...";

    if(messageMode === 'sms'){
      var apptdetail = {
        id: appointment.patient_id,
        aptNum: appointment.appointment_sr_no,
        aptDateTime: `${appointment.date} ${appointment.time} `,
        patient_name: appointment.patient_name,
        cell: appointment.cell,
      }
        var apptdetailObj = {apptdetail: apptdetail};
        var remindSms = this.appintmentService.sendCommunication(apptdetailObj)
        .subscribe(response => {
          this.reminderSmsResponse = response;
          if(response !== null && response !== undefined){
            this.reminderResult = this.reminderSmsResponse.message;
            appointment.isSmsSent = 1;
            appointment.displayStatus = "Reminder sent";
            appointment.smsReminderTitle = "Sent few seconds ago"; //Needs to update time 
          }
          else{
            appointment.isSmsSent = 0;
            appointment.displayStatus = "Not sent";
            this.reminderResult = `Failed to send reminder to ${appointment.patient.firstname} ${appointment.patient.middlename} ${appointment.patient.lastname}`
          }
        },
        (err: HttpErrorResponse) => {
          appointment.isSmsSent = 0;
          appointment.displayStatus = "Not sent";
        this.reminderResult = err.toString();
        });
    }
    
  }
  confirmAppointment(appointment: AppointmentModel) {

    if (appointment.confirmed == 21 || appointment.confirm_status === 'Confirmed') {
      this.alertType = 'alert-danger';
      this.errorMessage = `Looks like appointment is already confirmed for ${appointment.patient_name}`;
      return false;
    }

    var aptNum = { aptNum: appointment.appointment_sr_no };
    this.appintmentService.updateConfirmation(aptNum).subscribe(response => {
      this.appointmentConfirmationResponse = response;
      if (this.appointmentConfirmationResponse.status === 'true') {
        appointment.confirm_status = 'Confirmed';
        appointment.confirmed = 21;
        appointment.confirmed_on_date = moment().format('MM/DD/YYYY HH:mm'); //formatDate(this.dateService.getDateTime(), 'MM/dd/yyyy', 'en-US');
        appointment.confirmed_on_title = `Confirmed on ${appointment.confirmed_on_date}`;
        appointment.confirm_icon = 'fas fa-check status-green';
        this.alertType = 'alert-secondary';
        this.errorMessage = `${this.appointmentConfirmationResponse.message} for ${appointment.patient_name}`;
      }
      else {
        this.alertType = 'alert-danger';
        this.errorMessage = this.appointmentConfirmationResponse.message;
      }
    }, (err) => {
      this.errorMessage = err.message;
    });
  }

  rescheduleAppointment(appointment){

  }

  requestFeedback(appointment: AppointmentModel, messageMode) {
    this.reminderResult = '';
    if (messageMode === 'sms') {
      var apptdetailObj = { apptdetail: appointment, messageType: 'feedback' };
      this.callReminderService(apptdetailObj);
      /*
      var remindSms = this.appintmentService.sendReminder(apptdetailObj)
        .subscribe(response => {
          this.reminderSmsResponse = response;
          if (this.reminderSmsResponse.status === 'true') {
            this.errorMessage = this.reminderSmsResponse.message;
            this.alertType = 'alert-secondary';
          }
          else {
            this.errorMessage = this.reminderSmsResponse.message;
            this.alertType = 'alert-danger';
          }
        },
          (err: HttpErrorResponse) => {
            this.errorMessage = err.toString();
            this.alertType = 'alert-danger';
          });*/
    }
  }
  
  sendReviewsLink(appointment, messageMode) {
    if (messageMode === 'sms') {
      var apptdetailObj = { apptdetail: appointment, messageType: 'review' };
      this.callReminderService(apptdetailObj);
    }
  }

  callReminderService(apptdetailObj){

    var remindSms = this.appintmentService.sendReminder(apptdetailObj)
        .subscribe(response => {
          this.reminderSmsResponse = response;
          if (this.reminderSmsResponse.status === 'true') {
            this.errorMessage = this.reminderSmsResponse.message;
            this.alertType = 'alert-secondary';
          }
          else {
            this.errorMessage = this.reminderSmsResponse.message;
            this.alertType = 'alert-danger';
          }
        },
          (err: HttpErrorResponse) => {
            this.errorMessage = err.toString();
            this.alertType = 'alert-danger';
          });
  }


  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first  
      dtInstance.clear();    
      dtInstance.destroy();
      // Call the dtTrigger to rerender again       
      this.dtTrigger.next();
    });
  }   

     

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }   


  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}
