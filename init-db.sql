-- Create the table for advertising structures
CREATE TABLE IF NOT EXISTS advertising_structures (
    id SERIAL PRIMARY KEY,
    original_id INTEGER,
    address TEXT,
    type TEXT,
    subtype TEXT,
    size TEXT,
    sides INTEGER,
    total_area TEXT,
    placement_address TEXT,
    x_coord NUMERIC,
    y_coord NUMERIC,
    owner TEXT,
    page INTEGER,
    note TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    occupied BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_advertising_structures_type ON advertising_structures(type);
CREATE INDEX IF NOT EXISTS idx_advertising_structures_occupied ON advertising_structures(occupied);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_advertising_structures_updated_at
BEFORE UPDATE ON advertising_structures
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 