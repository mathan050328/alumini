import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon: IconProp, title, description, message, action }) => {
  const desc = description || message;

  const renderIcon = () => {
    if (!IconProp) return null;
    if (React.isValidElement(IconProp)) {
      return IconProp;
    }
    if (typeof IconProp === 'function') {
      const Component = IconProp;
      return <Component className="w-14 h-14 text-gray-300" />;
    }
    return null;
  };

  const renderAction = () => {
    if (!action) return null;
    if (React.isValidElement(action)) {
      return action;
    }
    if (typeof action === 'object') {
      if (action.link) {
        return (
          <Link
            to={action.link}
            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {action.label}
          </Link>
        );
      }
      if (action.onClick) {
        return (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {action.label}
          </button>
        );
      }
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {IconProp && <div className="mb-4 flex justify-center">{renderIcon()}</div>}
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>}
      {desc && <p className="text-gray-500 text-sm max-w-md mb-2 leading-relaxed">{desc}</p>}
      {renderAction()}
    </div>
  );
};

export default EmptyState;
