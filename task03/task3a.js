class Person{
#email;
#id;

    constructor(name,email,id){
        this.name=name;
        this.email=email;
        this.id=id;
}

    get email(){
        return this.#email;
    }

    get id(){
        return this.#id;
    }

    set email(newEmail){
        const isValidFormat= /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);
        if (!isValidFormat){
            console.log(`${newEmail} invalid Email, Write valid email.`);
            return;
        }
            this.#email=newEmail;
    }

    set id(newId){
        if (typeof newId !== "string" || newId.trim() === ""){
            console.log("Invalid ID, Write a right ID.");
            return;
        }
        this.#id=newId;
    }

    describeRole(){
        console.log(`${this.name} has no specific role defined.`);
    }
}

class Principal extends Person{
    #members=[];

    constructor(name,email,id){
        super(name,email,id)
    }

    addMembers(member){
        this.#members.push(member);
        console.log(`${member.name} has been added.`);
    }

    removeMembers(memberId){
        const index= this.#members.findIndex((m)=> m.id === memberId);
        if (index=== -1){
            console.log(`NO member found with ID ${memberId}.`);
            return;
        }
        const removed = this.#members.splice(index, 1)[0];
        console.log(`${removed.name}, Removed Succefully.`);
    }

    listMembers(){
        this.#members.forEach((m)=> console.log(`- ${m.name} ${m.id}`))
    }

    describeRole(){
        console.log(`${this.name} oversees the school and manges its staff and students.`);
    }
}

class Teacher extends Person{
    #studentGrades=[];

    constructor(name,email,id,subject){
        super(name,email,id);
        this.subject= subject;
    }

    studentGrades(studentName, grade){
        this.#studentGrades.push({studentName,grade});
        console.log(`${this.name} has graded ${studentName} : ${grade}.`);
    }

    listGradedStudents(){
        console.log(`Students graded by ${this.name} (${this.subject}):`);
        this.#studentGrades.forEach((s)=> console.log(`- ${s.studentName}: ${s.grade}`));

    }

    describeRole(){
        console.log(`${this.name} teaches ${this.subject} and grades student performance.`);
    }
}

class Students extends Person{
    #enrolledSubjects=[];
    
    constructor(name,email,id){
        super(name,email,id);
    }

    enroll(subject) {
    if (this.#enrolledSubjects.includes(subject)) {
      console.log(`${this.name} is already enrolled in ${subject}.`);
      return;
    }
    this.#enrolledSubjects.push(subject);
    console.log(`${this.name} enrolled in ${subject}.`);
    }

    viewEnrolledSubjects(){
        console.log(`${this.name}'s enrolled subjects:`);
        this.#enrolledSubjects.forEach((s)=> console.log(`- ${s}`));
    }

    describeRole(){
        console.log(`${this.name} is a student attending classes.`);
    }
}

const principal= new Principal("Dr. Mohammed", "mohammed@gmail.com", "PR001");
const teacher= new Teacher("Mr. Hany","hanymm@yahoo.com","T001", "Mathmatics");
const student= new Students("Ammar", "ammar@hotmail.com","S001");

principal.addMembers(teacher);
principal.addMembers(student);
principal.listMembers();

teacher.studentGrades("Ammar", "A");
teacher.listGradedStudents();

student.enroll("Mathmatics");
student.enroll("Physics");
student.viewEnrolledSubjects();

const allMembers= [principal, teacher, student];

console.log("Roles of All Members");

for(let member of allMembers){
    member.describeRole();
}