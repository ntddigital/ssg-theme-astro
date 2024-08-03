import React from 'react';

const Hello:React.FC<{name:string}> = (props) => {
  return (
    <div>
      <h3 className="text-green-500">Hello, {props.name}! - from React</h3>
    </div>
  );
};

export default Hello;