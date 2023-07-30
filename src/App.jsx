import React,{useState, useRef} from 'react'
import './App.css';
import {FiImage} from  'react-icons/fi'
import Sheet from 'react-modal-sheet'
import toast,{ Toaster } from 'react-hot-toast';
import {createWorker} from 'tesseract.js';
import { CSVLink } from 'react-csv';
import logo from './assets/logo.png'
import Papa from 'papaparse'


const App = () => {
  const photoUploader = useRef(null)
  const csvUploader = useRef(null)
  const [temp, setTemp] = useState('');
  const [cardHasBack, setCardHasBack] = useState(false)
  const [photo, setPhoto] = useState();
  const [existingFile, setExistingFile] = useState()
  const [showCSVBottomSheet, setShowCSVBottomSheet] = useState(false)
  const [showPhotoBottomSheet, setShowPhotoBottomSheet] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const getfile=(photo)=>{
    setTemp(extractedText);
    setExtractedText('');
    setPhoto(photo);
    setExistingFile()
    setShowPhotoBottomSheet(false)
  }

  const extractText=async()=>{
    
    const loading = toast.loading(`Loading..`);
    try {
      
      const worker = await createWorker({
        logger: m => {
          if(m.progress ==1 && m.status=='recognizing text' ){
            toast.dismiss(loading);
          }
        }
       });
       (async () => {
        await worker.loadLanguage('eng+hin');
        await worker.initialize('eng+hin');
        const { data: { text } } = await worker.recognize(photo);
        if(cardHasBack){
          setExtractedText(temp+text);
        }
        else{
          setExtractedText(text);
        }
        setTemp(extractedText)
        await worker.terminate();
      })();
    } catch (error) {
      toast.dismiss(loading)
      toast.error(error);
    } 
     
  }

  const copyToClipboard = ()=>{
    navigator.clipboard.writeText(extractedText);
    toast.success('Copied to Clipboard !',{
      style:{
        fontFamily:'sans-serif'
      }
    })
  }

  const generateCSVData=()=>{

    const phoneNoValidator = /(\+91(-)?)?( )?(0)?[0-9\-]{8,12}/g
    const emailValidator = /[A-Za-z._0-9]{3,}@[A-Za-z]{3,}[.]{1}[A-Za-z.]{2,}/g
    const nameValidator = /(Mr\. )?[A-Za-z.\u0900-\u097F]{3,}( )?[A-Za-z\u0900-\u097F]{3,}/g
  
    const name = extractedText.match(nameValidator)
    const phone_no =  extractedText.match(phoneNoValidator)
    const email_id = emailValidator.exec(extractedText);
    
    const data ={
      name:'',
      phone_no:'',
      email_id: ''
    }

    if(name){
      data.name = name.join(',');
    }
    if(email_id){
      data.email_id = email_id.join(',')
    }
    if(phone_no){
      data.phone_no = phone_no.join(',');
    }
    return  data;

  }

  

  const exportCSV=()=>{
    var jsonData =[];
    if(existingFile){
      Papa.parse(existingFile , {
            header:true,
            complete:function(results) {
              jsonData = results.data;
            }
          })      
    }
    jsonData.push(generateCSVData())
    console.log(jsonData)
    var csv =  Papa.unparse(jsonData)    
    console.log(csv)

    var csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    var csvURL =  null;
    if (navigator.msSaveBlob)
    {
        csvURL = navigator.msSaveBlob(csvData, 'download.csv');
    }
    else
    {
        csvURL = window.URL.createObjectURL(csvData);
    }

    return csvURL;
  }

  return (
    <div id="main" >
      <img src={logo} id='logo'   onClick={()=>{
        setExtractedText('');
        setPhoto();
      }} />
      {extractedText.length > 0
        ?<>
          {extractedText.split('\n').map((d,i)=>(
            <p className='extractedText'  key={i} >{d}</p>
          ))}
          
          <button id='homeScreenBtn' onClick={()=>copyToClipboard()} >Copy Text</button>
          
          <button id='homeScreenBtn' onClick={()=>setShowCSVBottomSheet(true)} >Export</button>
          
          <button id='homeScreenBtn' onClick={()=>{
            setCardHasBack(true);
            setShowPhotoBottomSheet(true);
          }} >Select Other Side</button>
          <button id='homeScreenBtn' onClick={()=>setShowPhotoBottomSheet(true)} >Select Another Image</button>
          
          
          <Sheet id='bottomSheetContainer' isOpen={showCSVBottomSheet} onClose={() => setShowCSVBottomSheet(false)} detent="content-height" >
            <Sheet.Container style={{
              borderTopRightRadius:25,
              borderTopLeftRadius:25
            }}>
              <Sheet.Header />
              <Sheet.Content id='content' style={{
                backgroundColor:'white'
              }} >
                <a href={exportCSV()} id="homeScreenBtn"  >NewFile</a>
                <button id='homeScreenBtn' onClick={()=> {csvUploader.current.click()} } >Select Existing File</button>

                {
                  existingFile &&
                  <a href={exportCSV()} id="homeScreenBtn">Export</a>

                }

                <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" id="file" ref={csvUploader} onChange={(e)=>{
                  setExistingFile(e.target.files[0])
                }} style={{display: "none"}}/>
              </Sheet.Content>
            </Sheet.Container>
            <Sheet.Backdrop />
          </Sheet>
        </>
        :<>
          {
            photo
            ? <h1 id="filename">{photo.name}</h1> 
            : <h1 id="heading">Welcome!</h1>
          }
          {
            photo 
            ?
            <>
              <button id='homeScreenBtn' onClick={()=>{extractText()}} >Extract Text</button>
              <button id='homeScreenBtn' onClick={()=>setShowPhotoBottomSheet(true)} >Select Another Image</button>
            </>
            :
            <button id='homeScreenBtn' onClick={()=>setShowPhotoBottomSheet(true)} >Get Started</button>

          }
        </>
      }
      <Sheet id='bottomSheetContainer' isOpen={showPhotoBottomSheet} onClose={() => setShowPhotoBottomSheet(false)} detent="content-height" >
        <Sheet.Container style={{
          borderTopRightRadius:25,
          borderTopLeftRadius:25
        }}>
          <Sheet.Header />
          <Sheet.Content id='content' onClick={()=>photoUploader.current.click()} style={{cursor:'pointer'}} >
            <FiImage size={60} color='gray' />
            <h1 id='contentHeading'>Upload photo</h1>
            <input type="file" accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*;capture=camera" id="file" ref={photoUploader} onChange={(e)=>getfile(e.target.files[0])} style={{display: "none"}}/>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
      <Toaster />
    </div>
  )
}

export default App
  