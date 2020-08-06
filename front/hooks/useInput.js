import { useState, useCallback } from 'react';

export default (initialValue) => {
  const [value, setValue] = useState(initialValue);
  const handle = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  return [value, handle, setValue];
};
