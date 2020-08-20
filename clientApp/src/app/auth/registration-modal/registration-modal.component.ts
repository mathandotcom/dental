import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommunicationService } from '../communication.service';
import { BridgeService } from 'src/app/shared/bridge.service';

@Component({
  selector: 'app-registration-modal',
  templateUrl: './registration-modal.component.html',
  styleUrls: ['./registration-modal.component.css']
})
export class RegistrationModalComponent implements OnInit {
  @Output() reloadData = new EventEmitter<any>();
  message: string = "child";
  parentMessage = "message from parent";

  constructor(
    public model: NgbActiveModal,
    private modalService: NgbModal,
    private bridgeService:BridgeService,
  ) { }

  sendMessage() {
    console.log(this.message);
    this.reloadData.emit(this.message);
    this.bridgeService.sendData(JSON.stringify({'message':this.message}));

  }

  ngOnInit(): void { }

}
