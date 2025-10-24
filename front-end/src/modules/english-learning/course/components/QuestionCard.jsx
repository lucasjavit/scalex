import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function QuestionCard({ onSubmit }) {
  const { t } = useTranslation(['englishCourse', 'common']);
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(answer);
    setAnswer('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={t('englishCourse:placeholders.typeYourAnswer', 'Type your answer here...')}
        className="input-copilot w-full"
      />
      <button className="btn-copilot-primary" type="submit">
        {t('common:actions.submit', 'Submit')}
      </button>
    </form>
  );
}
