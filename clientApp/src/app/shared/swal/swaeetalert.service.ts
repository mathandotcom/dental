import { Injectable } from '@angular/core';
import Swal from 'sweetalert2'; 
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class SwaeetalertService {

  constructor(
    public model: NgbActiveModal,
    private modalService: NgbModal,

  ) { }


  
  showResponseMessage(message: string, type: string){
    var messageType = '';
    var title = type === 's' ? `Mail has been sent`: `Failed to send a mail`;
    if(type === 'e'){
      Swal.fire({icon:'error', title: title, confirmButtonText: 'Close'})
    }
    else{
      Swal.fire({icon:'success', title: title,
      showCancelButton: true, confirmButtonText: 'Ok', cancelButtonText: 'Close' })
         .then((result) => {
           if (result.value) {
            this.modalService.dismissAll();
           }
           else{
             this.modalService.dismissAll();
           }
         });
    }
  }
  

}
