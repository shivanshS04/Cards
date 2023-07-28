import React,{useState, useRef} from 'react'
import './App.css';
import {FiImage} from  'react-icons/fi'
import Sheet from 'react-modal-sheet'
import toast,{ Toaster } from 'react-hot-toast';
import {createWorker} from 'tesseract.js';
import { CSVLink } from 'react-csv';
import logo from './assets/logo.png'

const App = () => {
  const fileUploader = useRef(null)
  const [photo, setPhoto] = useState();
  const [showBottomSheet, setShowBottomSheet] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const getfile=(photo)=>{
    setExtractedText('');
    setPhoto(photo);
    setShowBottomSheet(false)
  }

  const extractText=async()=>{
    
    const loadingToast = toast.loading("Loading...");
    try {
      const worker = await createWorker({
        logger: m => console.log(m)
       });
      (async () => {
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(photo);
        setExtractedText(text);
        await worker.terminate();
      })();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error);
    } 
    finally{
      toast.dismiss(loadingToast);
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
          <CSVLink id='homeScreenBtn' filename='data' data={extractedText} separator='\n' >Export</CSVLink>
          <button id='homeScreenBtn' onClick={()=>setShowBottomSheet(true)} >Select Another Image</button>
          
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
              <button id='homeScreenBtn' onClick={()=>setShowBottomSheet(true)} >Select Another Image</button>
            </>
            :
            <button id='homeScreenBtn' onClick={()=>setShowBottomSheet(true)} >Get Started</button>

          }
        </>
      }
      <Sheet id='bottomSheetContainer' isOpen={showBottomSheet} onClose={() => setShowBottomSheet(false)} detent="content-height" >
        <Sheet.Container style={{
          borderTopRightRadius:25,
          borderTopLeftRadius:25
        }}>
          <Sheet.Header />
          <Sheet.Content id='content' onClick={()=>fileUploader.current.click()} style={{cursor:'pointer'}} >
            <FiImage size={60} color='gray' />
            <h1 id='contentHeading'>Upload photo</h1>
            <input type="file" accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*" id="file" ref={fileUploader} onChange={(e)=>getfile(e.target.files[0])} style={{display: "none"}}/>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
      <Toaster />
    </div>
  )
}

export default App
  