import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-noticy-alert',
  standalone: true,
  imports: [],
  templateUrl: './noticy-alert.component.html',
  styleUrl: './noticy-alert.component.css'
})
export class NoticyAlertComponent {
  @Input toast:Toast;
  alert:string ='';
  txt:string ='';
  constructor() { }
  
  ngOnInit(): void {
    
  }
}
