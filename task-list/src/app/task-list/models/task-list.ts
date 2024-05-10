// {
//     "id": 0,
//     "name": "To Do",
//     "list":[
//         "todo",
//         "todo1"
//     ]
// },
export interface ITaskList{
    trim(): unknown;
    id: number;
    name: string;
    list:string[];
}