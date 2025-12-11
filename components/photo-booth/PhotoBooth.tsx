
import React, { useState, useRef } from 'react';
import { Camera, Upload, Download, RefreshCw, User, Image as ImageIcon, Briefcase, Zap, AlertCircle, Move, Crop } from 'lucide-react';
import { Button } from '../ui/Button';
import { generateProfessionalPhoto } from '../../utils/gemini';

const SETTINGS = [
  { id: 'unchanged', label: 'Keep Original' },
  { id: 'studio', label: 'Professional Studio (Neutral Grey)' },
  { id: 'office', label: 'Modern Office' },
  { id: 'nature', label: 'Outdoor Nature' },
  { id: 'library', label: 'Classic Library' }
];

const OUTFITS = [
  { id: 'unchanged', label: 'Keep Original' },
  { id: 'suit', label: 'Formal Dark Suit' },
  { id: 'business_casual', label: 'Business Casual (Blazer)' },
  { id: 'turtleneck', label: 'Tech Minimalist (Black Turtleneck)' },
  { id: 'linen_shirt', label: 'Relaxed Linen Shirt' },
  { id: 'polo', label: 'Smart Polo Shirt' },
  { id: 'sweater', label: 'Premium Knit Sweater' }
];

const POSES = [
  { id: 'unchanged', label: 'Original Pose' },
  { id: 'crossed_arms', label: 'Arms Crossed' },
  { id: 'hands_by_side', label: 'Hands by Side' },
  { id: 'neutral', label: 'Neutral Professional' }
];

const FRAMES = [
  { id: 'original', label: 'Original Crop' },
  { id: 'shoulder', label: 'Shoulder Up (Passport)' },
  { id: 'waist', label: 'Waist Up' },
  { id: 'full', label: 'Full Body' }
];

export const PhotoBooth: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Settings State
  const [setting, setSetting] = useState('studio');
  const [outfit, setOutfit] = useState('suit');
  const [pose, setPose] = useState('unchanged');
  const [frame, setFrame] = useState('original');

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
          setError("File size too large. Please use an image under 4MB.");
          return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleSelect = async (type: 'male' | 'female') => {
    // URLs to royalty free images (Unsplash)
    const url = type === 'male' 
      ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80' 
      : 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80';
    
    setError(null);
    setGeneratedImage(null);
    
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage(e.target?.result as string);
        };
        reader.readAsDataURL(blob);
    } catch (e) {
        setError("Failed to load sample image.");
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateProfessionalPhoto(uploadedImage, setting, outfit, pose, frame);
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      setError("Failed to generate photo. Please try again with a clear photo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `clockin_headshot_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-serif text-zinc-900 mb-2">Photo Booth</h2>
        <p className="text-zinc-500 text-lg">Turn any photo of you into a professional headshot in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Upload Card */}
           <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-medium text-zinc-900 mb-4 flex items-center gap-2">
                 <Camera className="w-4 h-4" /> 1. Upload Photo
              </h3>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all mb-4
                  ${uploadedImage ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-300 hover:bg-zinc-50'}
                `}
              >
                 {uploadedImage ? (
                    <div className="relative w-32 h-32 mx-auto">
                        <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover rounded-lg shadow-sm" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                             <span className="text-xs text-white font-medium">Change</span>
                        </div>
                    </div>
                 ) : (
                    <>
                       <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center mx-auto mb-3">
                           <Upload className="w-5 h-5 text-zinc-400" />
                       </div>
                       <p className="text-sm font-medium text-zinc-700">Click to upload photo</p>
                       <p className="text-xs text-zinc-400 mt-1">PNG, JPG up to 4MB</p>
                    </>
                 )}
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleFileUpload} 
                   accept="image/*" 
                   className="hidden" 
                 />
              </div>

              {!uploadedImage && (
                  <div className="text-center pt-2 border-t border-zinc-100">
                      <p className="text-xs text-zinc-500 mb-3">Or try with a sample photo:</p>
                      <div className="flex gap-2 justify-center">
                          <button onClick={(e) => { e.stopPropagation(); handleSampleSelect('male'); }} className="text-xs bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded transition-colors">
                              Sample 1
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleSampleSelect('female'); }} className="text-xs bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded transition-colors">
                              Sample 2
                          </button>
                      </div>
                  </div>
              )}
              
              <div className="mt-4 p-3 bg-zinc-50 rounded-lg text-xs text-zinc-500 space-y-1">
                  <p className="font-medium text-zinc-700 mb-1">For best results:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                      <li>Face should be unobstructed and clearly visible</li>
                      <li>Ensure only one person is in the photo</li>
                      <li>Use a photo with decent lighting</li>
                  </ul>
              </div>
           </div>

           {/* Settings Card */}
           <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-medium text-zinc-900 mb-6 flex items-center gap-2">
                 <Zap className="w-4 h-4" /> 2. Customize Style
              </h3>
              
              <div className="space-y-6">
                 {/* Background */}
                 <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <ImageIcon size={12} /> Background
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                        <select 
                            value={setting} 
                            onChange={(e) => setSetting(e.target.value)}
                            className="w-full h-9 px-3 text-sm rounded-md border border-zinc-200 bg-white"
                        >
                            {SETTINGS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                    </div>
                 </div>

                 {/* Outfit */}
                 <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Briefcase size={12} /> Outfit
                    </label>
                    <select 
                        value={outfit} 
                        onChange={(e) => setOutfit(e.target.value)}
                        className="w-full h-9 px-3 text-sm rounded-md border border-zinc-200 bg-white"
                    >
                        {OUTFITS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                 </div>

                 {/* Pose */}
                 <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Move size={12} /> Pose
                    </label>
                    <select 
                        value={pose} 
                        onChange={(e) => setPose(e.target.value)}
                        className="w-full h-9 px-3 text-sm rounded-md border border-zinc-200 bg-white"
                    >
                        {POSES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                 </div>

                 {/* Frame */}
                 <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Crop size={12} /> Framing
                    </label>
                    <select 
                        value={frame} 
                        onChange={(e) => setFrame(e.target.value)}
                        className="w-full h-9 px-3 text-sm rounded-md border border-zinc-200 bg-white"
                    >
                        {FRAMES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                 </div>
              </div>
           </div>
           
           <Button 
             onClick={handleGenerate} 
             disabled={!uploadedImage || isGenerating}
             className="w-full h-12 text-base"
           >
             {isGenerating ? (
               <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
             ) : (
               <><User className="mr-2 h-4 w-4" /> Generate</>
             )}
           </Button>

           {error && (
               <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                   <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                   {error}
               </div>
           )}

        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-8">
            <div className="bg-zinc-900 rounded-2xl h-[600px] flex items-center justify-center relative overflow-hidden shadow-2xl">
                 {/* Background Blur Effect */}
                 <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black"></div>
                 <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                 {generatedImage ? (
                     <div className="relative z-10 w-full h-full p-8 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700">
                         <img 
                           src={generatedImage} 
                           alt="Professional Headshot" 
                           className="max-h-[450px] rounded-lg shadow-2xl border border-zinc-700/50 object-contain"
                         />
                         <div className="mt-8 flex gap-4">
                             <Button onClick={handleDownload} className="bg-white text-zinc-900 hover:bg-zinc-200">
                                 <Download className="mr-2 h-4 w-4" /> Download High-Res
                             </Button>
                             <Button variant="outline" onClick={() => setGeneratedImage(null)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                 Discard
                             </Button>
                         </div>
                     </div>
                 ) : (
                     <div className="relative z-10 text-center space-y-4 max-w-md p-6">
                         <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700">
                             <Camera className="w-8 h-8 text-zinc-500" />
                         </div>
                         <h3 className="text-xl font-medium text-white">Upload a photo where your face is clearly visible, choose your preferred styles, and view your transformation!</h3>
                     </div>
                 )}
            </div>
            
            {/* Removed the bottom features list as requested */}
        </div>

      </div>
    </div>
  );
};
