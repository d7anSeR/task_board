import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import {
  CdkDropListGroup,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
  
} from '@angular/cdk/drag-drop';
import { ITaskList } from './models/task-list';
import { TaskListService } from './services/task-list.service';
import {MatInputModule} from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { __makeTemplateObject } from 'tslib';
import { ThisReceiver } from '@angular/compiler';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, MatInputModule, FormsModule, MatButtonModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit{
  private taskListService = inject(TaskListService);
  taskList!: ITaskList[];
  prevValue!: string | null;
  prevListValue!: string | null;
  currentEditTaskListId!: number | null;
  currentEditTaskIdx!: number| null;

  currentEditId!: number | null;
  @ViewChild('myInput') myInput!: ElementRef;
  ngOnInit(): void {
    this.getTaskList();
  }
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    let updateTask = this.updateTask(this.taskList);
    firstValueFrom(updateTask).then(()=>{
      this.resetTaskValues();
      this.resetListValues();
    });
  }
  getTaskList(){
    this.taskListService.getTaskList().subscribe(
      {
        next:(data) => {
          this.taskList = data;
        },
        error:(err)=>{
          console.log(err);
        }
      });
  }
  
  deleteTask(id:number, idx:number, discard:boolean= false){
    let listIndex = this.taskList.findIndex((list) => list.id === id);
    if(discard){
      if(this.prevValue != null){
        if(this.prevValue.trim().length == 0){
          this.taskList[listIndex].list.splice(idx, 1);
          this.updateTask(this.taskList);
        }
        else{
          this.taskList[listIndex].list[idx] = this.prevValue;
          this.resetTaskValues();
        }
      }
        
      
    }
    else{
      this.taskList[listIndex].list.splice(idx, 1);
    let task = this.updateTask(this.taskList);
    firstValueFrom(task).then(()=>{
      this.resetTaskValues();
    });
    }    
  }
  updateTask(taskList: ITaskList[]){
    return this.taskListService.updateTaskList(taskList);
  }
  addTask(id:number, idx:number){
    this.taskList[idx].list.push(' ');
    this.editTask(id, this.taskList[idx].list.length-1);
  }
  editTask(id:number, idx:number){
    let listIndex = this.taskList.findIndex((list) => list.id === id);
    if(this.currentEditTaskListId == id && this.currentEditTaskIdx == idx){
      if(this.taskList[listIndex].list[idx].trim().length === 0){
        this.deleteTask(id, idx, true);
      }
      let task = this.updateTask(this.taskList);
      firstValueFrom(task).then(()=>{
        this.resetTaskValues();
        return;
      });
    }
    this.prevValue = this.taskList[listIndex].list[idx];
    this.currentEditTaskListId = id;
    this.currentEditTaskIdx = idx;
    
    
  }
  editList(id:number){
    if(this.currentEditId == id){
      let list = this.updateTask(this.taskList);
      firstValueFrom(list).then(()=>{
        this.resetListValues();
        return;
      });
    }
    this.currentEditId = id;
    window.setTimeout(()=>{
      this.myInput.nativeElement.focus();
    });
  }
  deleteList(id:number, idx:number, discard: boolean){
    let listIndex = this.taskList.findIndex((list) => list.id === id);
    if(discard){
      if(this.prevListValue !== null){
        this.taskList[listIndex].name = this.prevListValue;
        this.resetListValues();
      }
    }
      else{
        this.taskList.splice(listIndex, 1);
        let list = this.updateTask(this.taskList);
        firstValueFrom(list).then(()=>{
          this.resetListValues();
          return;

        });
      }
  }
  resetListValues(){
    if(this.currentEditId !== null){
      this.currentEditId = null;
    }
  }
  addList(){
    this.taskList.push(
      {
        id: new Date().getTime(),
        trim: function (): unknown {
          throw new Error('Function not implemented.');
        },
        name: '',
        list: []
      },
  );
  this.updateTask(this.taskList).subscribe(()=>{
    let id = this.taskList[this.taskList.length-1].id;
    this.editList(id);
  })
  }
  resetTaskValues(){
    if(this.currentEditTaskListId !== null  && this.currentEditTaskIdx !== null){
      this.currentEditTaskListId = null;
      this.currentEditTaskIdx = null;
    }
    else if(this.currentEditId !== null)
      this.currentEditId = null;
    
    this.prevValue = null;
  }
}
