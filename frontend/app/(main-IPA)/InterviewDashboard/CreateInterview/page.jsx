"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress';
import FormContainer from './_components/FormContainer';
import { ArrowLeft } from 'lucide-react';


function CreateInterview() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const onHandleInputChanges = (field, value) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [field]: value
      };
      console.log("FormData", updatedData);
      return updatedData;
    });
  }

  return (
    <div className="min-h-screen p-10">
      <div className="flex items-center gap-5 justify-center relative mb-8">
        <ArrowLeft 
          onClick={() => router.back()} 
          className='cursor-pointer absolute left-0 text-gray-300 hover:text-white transition-colors' 
        />
        <h2 className="font-bold text-3xl text-gray-100">Create New Interview</h2>
      </div>
      <Progress 
        value={step * 33.33} 
        className='mt-6 mb-8 max-w-2xl mx-auto h-2 bg-slate-800/50 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500'
      />
      <FormContainer onHandleInputChanges={onHandleInputChanges}/>
    </div>
  )
}

export default CreateInterview