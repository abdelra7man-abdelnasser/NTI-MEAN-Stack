// 1- Booking an Appointment

const bookedSlots=["a1","a2","a3","b1","b2","b3"]

function bookAppointment(slot){

    return new Promise((resolve,reject)=>{
    
        setTimeout(()=>{

            if (bookedSlots.includes(slot)){

                reject (new Error(`Slot "${slot}" is already booked`));

            }

            else
            {

                bookedSlots.push(slot)
                resolve(`Slot "${slot}" booked succefully`)
            }

        }, 1000);
    }
    );
}

async function bookNow(slot) {

    try{

        const message = await bookAppointment(slot);
        console.log(message);
    }
    
    catch(err){

        console.error(err.message);

    }
}

bookNow("c1");

bookNow("b3");

bookNow("a1");



// 2- Check Server Status with Retry

function pingServer(){

    return new Promise((resolve,reject)=>{

        setTimeout(()=>{

            const isOnline= Math.random() > 0.5;

            if (isOnline){

                resolve("Server is online");
            }

            else{

                reject("Server is Offline");
            }


        },500);


    });
}

async function checkRetryTimes(maxAttempts=5) {

    for (let attempt=1; attempt<=maxAttempts; attempt++){
    try{
        console.log(`Attempt "${attempt}": Pinging server....`);
        const result = await pingServer();
        console.log(result);
    }
    catch(err){
        console.log(`Attempt "${attempt}" failed `);
        if (attempt === maxAttempts){
            console.log(`Server unreachable after "${maxAttempts}" attempts`);
        }
    }
}}

checkRetryTimes()




