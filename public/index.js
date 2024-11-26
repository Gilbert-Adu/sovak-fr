const form = document.getElementById("progressiveForm");
const steps = Array.from(document.querySelectorAll(".form-step"));
const progress = document.getElementById("progress");
let currentStep = 0;


const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
// Function to update progress bar and buttons
let formData = {};

async function submitForm() {

    //1. go to payment page instead in the next step function



    const videoInput = document.getElementById('videoInput');
    const imageInput = document.getElementById('imageInput');

    //for image submission
    if (imageInput && imageInput.files) {
        const imageFile = document.getElementById('imageInput').files[0];

        if (imageFile) {
            const formimageData = new FormData();
            formimageData.append('file', imageFile);

            //http://34.201.173.137:5001/upload
            const response = await fetch('http://localhost:5001/upload', {
                method: 'POST',
                body: formimageData
            });
            const data = await response.json();
            console.log("data: ", data);
            if (response.ok) {
                console.log("photo id is: ", data.fileUrl)
                //formData["photo_id"] = data.fileUrl;

                //use set photo id here
                sessionStorage.setItem('photo_id', JSON.stringify(data.fileUrl));

                alert(`image url in vanilla js is: ${data.fileUrl}`)
            }else {
                alert(`Failed to upload image: ${data.error}`)

            }
        }
    }


    //for video submission
    if (videoInput && videoInput.files ){
        const videoFile = document.getElementById('videoInput').files[0];

        if (videoFile) {
            //console.log("video: ", videoFile);
            formData['mediaType'] = videoFile.type
            //formData['video'] = await fileToBase64(videoFile);
            const formvideoData = new FormData();
            formvideoData.append('file', videoFile);

            //http://34.201.173.137:5001/upload
            const response = await fetch('http://localhost:5001/upload', {
                method: 'POST',
                body: formvideoData
            });
            const data = await response.json();
            if (response.ok) {
                formData['file_url'] = data.fileUrl;
                //console.log('data: ', data)
                //console.log("file_url: ", data.fileUrl)
                sessionStorage.setItem('video_url', JSON.stringify(data.fileUrl));

                alert(`file url in vanilla js is: ${data.fileUrl}`)
                //console.log('file url is: ', data['fileUrl'])
            }else {
                alert(`Failed to upload file: ${data.error}`)
            }
            /**
             * const reader = new FileReader();
            reader.readAsDataURL(videoFile);
            reader.onload = async function () {
                const base64video = reader.result
                console.log('base64video: ', base64video)
                formData['video'] = base64video;

            }

             */
            
        }
    }else {
        formData['video'] = {};


    }

    

    

    try {
        
        /**
         * const response = await fetch('http://localhost:5001/create-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        console.log('Response from python backend: ', data)
        

         */
        console.log(formData);
        document.getElementById('loading-overlay').style.display = 'block';
        setTimeout(() => {
            document.getElementById('loading-overlay').style.display = 'none';
            //window.location.href="/"
        }, 10000)

        setTimeout(() => {
            let report_type = sessionStorage.getItem('report_type');
            let videoUpload = sessionStorage.getItem('videoUpload');

            
            const data = {'report_type': report_type, 'videoUpload': videoUpload}
            const queryString = new URLSearchParams(data).toString();
            //http://34.201.173.137:3000/stripe?${queryString}
            window.location.href=`http://localhost:3000/stripe?${queryString}`
        }, 2000)


    }catch(error) {
        console.error("Error sending data: ", error);
    }


};



function updateProgress() {
    const progressPercentage = ((currentStep + 1) / steps.length) * 100;
    progress.style.width = `${progressPercentage}%`;

    document.getElementById("backBtn").style.display = currentStep > 0 ? "inline-block" : "none";
    document.getElementById("nextBtn").textContent = currentStep === steps.length - 1 ? "Proceed to Payment" : "Next";

    /**
     * if (document.getElementById("nextBtn").textContent == 'Submit') {
        document.getElementById("nextBtn").type = "submit";
    }
     */
}

function getCurrentStep() {
    const currentStep = document.querySelector('.form-step.active');
    const currentStepAttr = currentStep.getAttribute('data-step');
    const modalHeader = document.getElementById('modal-header');
    if (parseInt(currentStepAttr, 10) == 12) {
        document.getElementById('subject_address').style.display = 'block';

    }else if (parseInt(currentStepAttr, 10) > 12) {
        document.getElementById('subject_address').style.display = 'none';
    }

    if (parseInt(currentStepAttr, 10) == 10) {
        const imageInputLabel = document.querySelector('.image-upload-container');
        imageInputLabel.style.display = 'block';
    }else if (parseInt(currentStepAttr, 10) > 10) {
        //hide image uploaded
        const imageInputLabel = document.querySelector('.image-upload-container');
        imageInputLabel.style.display = 'none';


    }
    if (parseInt(currentStepAttr, 10) >= 11 && parseInt(currentStepAttr, 10) <= 17) {
        modalHeader.innerText = 'Subject Info';
        modalHeader.style.color = 'red';

    }

    if (parseInt(currentStepAttr, 10) >= 18 && parseInt(currentStepAttr, 10) <= 25) {
        modalHeader.innerText = 'Incident Info';
        modalHeader.style.color = '#0D92F4';

    }

    if (parseInt(currentStepAttr, 10) > 25) {
        modalHeader.innerText = 'Report Info';
        modalHeader.style.color = 'green';

    }

    
}

// Function to go to the next step
async function nextStep() {
    const input =  steps[currentStep].querySelector("input") || steps[currentStep].querySelector("select");
    if (!input.checkValidity()) {
        input.reportValidity();
        return;
    }
    
    steps[currentStep].classList.remove("active");
    currentStep++;
    if (input.type == 'radio') {
        const radios = document.querySelectorAll(`input[name=${input.name}]`)
        for (i = 0; i < radios.length; i++) {
            if (radios[i].checked) {
                formData[radios[i].name] = radios[i].value;

                if (radios[i].name == 'altReport'){
                    formData['alt_reporter_name'] = document.getElementById('alt_reporter_input').value;
                    document.getElementById('alt_report_name').style.display = 'none';
                }
                if (radios[i].name == 'videoUpload'){
                        document.getElementById('upload-container').style.display = 'none';     
                }

                if (radios[i].name == 'address_question') {
                    formData['subject_address'] = document.getElementById('subject_address').value;
                }
            }
        }
        
    }else {
        
        formData[input.name] = input.value;
        if (input.name == 'report_type') {
            sessionStorage.setItem('report_type', input.value);
        }
        if (input.name == 'videoUpload') {
            sessionStorage.setItem('videoUpload', input.value);
        }
        

        
    }


    if (currentStep >= steps.length) {
        //form.submit();
        

        //console.log("submitting form...")
        //1. go to the payments page instead
        //2. while holding the entered post data. 
        //3. send the held data to the python backend temporarily
        submitForm();
        sessionStorage.setItem('userData', JSON.stringify(formData));

        
        
        //form.submit();


        //return;
    }

    steps[currentStep].classList.add("active");
    updateProgress();
    getCurrentStep();
    
}

// Function to go to the previous step
function previousStep() {
    steps[currentStep].classList.remove("active");
    currentStep--;
    steps[currentStep].classList.add("active");
    const input =  steps[currentStep].querySelectorAll("input[name=videoUpload]") || steps[currentStep].querySelector("select");
    for (i = 0; i < input.length; i++) {
        if (input[i].name != 'videoUpload') {
            document.getElementById('upload-container').style.display = 'none';


        }
    }
    if (input.type != 'radio')
    updateProgress();
    getCurrentStep();

}
// Initialize form
updateProgress();

document.getElementById('scan').addEventListener('click', () => {
    document.getElementById('search-container').style.display = 'block';
});

const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('keypress', (event) => {

    if (event.key === 'Enter') {
        const inputValue = searchInput.value;
        console.log('input value: ', inputValue);
        searchInput.value = '';
        //http://34.201.173.137:3000/search/${inputValue}
        window.location.href = `http://localhost:3000/search/${inputValue}`;

    }
});



