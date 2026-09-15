import React from 'react';
import { useQuestionState } from './hooks/useQuestionState';
import { PaperView } from './components/PaperView';
import { Sidebar } from './components/Sidebar';
import './styles/global.css';
import './styles/layout.css';

function App() {
  const questionState = useQuestionState('B4');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-container">
      <Sidebar questionState={questionState} />
      <PaperView
        questions={questionState.questions}
        paperSize={questionState.paperSize}
        onUpdateQuestion={(id, updates) => questionState.updateQuestion(id, updates)}
        onDeleteQuestion={(id) => questionState.deleteQuestion(id)}
        isEditable={true}
        onPrint={handlePrint}
      />
    </div>
  );
}

export default App;
