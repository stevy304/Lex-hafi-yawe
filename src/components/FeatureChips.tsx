import React from 'react';
import { Translations } from '../i18n/strings';

interface FeatureChipsProps {
  t: Translations;
}

export const FeatureChips: React.FC<FeatureChipsProps> = ({ t }) => {
  return (
    <>
      <div className="chip c1">
        <i />
        <span>{t.c1}</span>
      </div>
      <div className="chip c2">
        <i />
        <span>{t.c2}</span>
      </div>
      <div className="chip c3">
        <i />
        <span>{t.c3}</span>
      </div>
    </>
  );
};
