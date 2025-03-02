import React from 'react';

interface EmailTemplateProps {
  message: string;
}

const EmailTemplate = ({ message }: EmailTemplateProps) => {
  return <div>{message}</div>;
};

export default EmailTemplate;
