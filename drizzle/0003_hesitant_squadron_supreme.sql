ALTER TABLE `food_entries` ADD `scanContext` enum('meal','grocery','menu','label','recipe','shelf') DEFAULT 'meal' NOT NULL;
ALTER TABLE `food_entries` ADD `scanContext` enum('meal','grocery','menu','label','recipe','shelf') NOT NULL DEFAULT 'meal';
