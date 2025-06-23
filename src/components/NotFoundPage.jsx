import React from 'react';
import { useParams } from 'react-router-dom';

export default function NotFoundPage() {
   const { term } = useParams();
  return (
    <div className="list-page not-found">
      <p>
        Поимот „<strong>{term}</strong>“ не е пронајден или не постои!
      </p>
    </div>
  );
}