
// Section 1: Mini Projects

// 🏥 Project 1: Hospital Emergency Triage System

function emergencyHospital(patients){

    let normalTreated = []
    let n = 0
    let treatedImmedietly = []
    let i = 0
    let k = 0
    let missingData = []

    for (let patient of patients){

        if (patient.hasData !== false){

            if(patient.condition !== "critical"){

                normalTreated[n] = patient;
                n++;

           } else {

                treatedImmedietly[i] = patient;
                i++;
             }

            }


        else {

            missingData[k] = patient;
            k++;

             }
        }

    normalTreated.sort((a, b) => b.severity - a.severity);

    return { treatedImmedietly, normalTreated, missingData };
}


let patients = [
  {
    name: "Ali",
    severity: 5,
    hasData: true,
    condition: "critical"
  },
  {
    name: "Sara",
    severity: 3,
    hasData: true,
    condition: "normal"
  },
  {
    name: "Omar",
    severity: 4,
    hasData: false,
    condition: "normal"
  },
  {
    name: "Mona",
    severity: 2,
    hasData: true,
    condition: "normal"
  },
  {
    name: "Ahmed",
    severity: 1,
    hasData: true,
    condition: "critical"
  },
  {
    name: "Youssef",
    severity: 5,
    hasData: true,
    condition: "normal"
  },
  {
    name: "Nour",
    severity: 4,
    hasData: true,
    condition: "critical"
  },
  {
    name: "Laila",
    severity: 2,
    hasData: false,
    condition: "critical"
  }
];

console.log(emergencyHospital(patients));



// Section 2: Coding Problems

// 1️⃣ Check if Array is Sorted


function isSortedAscending(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) {
      return false; 
    }
  }
  return true; 
}

console.log(isSortedAscending([1, 2, 2, 5, 9])); 
console.log(isSortedAscending([1, 3, 2]));        



// 2️⃣ Return Numbers Greater Than a Value


function greaterThan(arr, value) {
  const result = [];
  for (const num of arr) {
    if (num > value) {
      result.push(num);
    }
  }
  return result;
}

console.log(greaterThan([1, 5, 8, 2, 10], 4));



// 3️⃣ Plus One (LeetCode)


function plusOne(digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) {
      digits[i]++;
      return digits;
    }
    digits[i] = 0; 
  }
  
  digits.unshift(1); 
  return digits;
}

console.log(plusOne([1, 2, 3]));
console.log(plusOne([9, 9, 9]));
console.log(plusOne([1, 2, 9]));


// 4️⃣ Remove Duplicates from Sorted Array (LeetCode)


function removeDuplicates(nums) {
  if (nums.length === 0) return 0;

  let k = 1; 

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[k - 1]) {
      nums[k] = nums[i];
      k++;
    }
  }

  return k;
}

let nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];
let k = removeDuplicates(nums);
console.log(k, nums); 