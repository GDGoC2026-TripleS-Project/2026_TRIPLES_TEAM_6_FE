import React, { useState } from 'react';
import Chip from './Chip';

type ChipToggleProps = {
  label: string;
};

const ChipToggle = ({ label }: ChipToggleProps) => {
  const [selected, setSelected] = useState(false);

  return (
    <Chip
    label={label}
    variant={selected ? 'filled' : 'outlined'}
    onPress={() => setSelected((prev) => !prev)}
    />
  );
};

export default ChipToggle;