import { useState } from 'react';
import ApplicationForm from './components/ApplicationForm';
import SuccessScreen from './components/SuccessScreen';

export default function App() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return <SuccessScreen />;
  }

  return <ApplicationForm onSuccess={() => setIsSubmitted(true)} />;
}
