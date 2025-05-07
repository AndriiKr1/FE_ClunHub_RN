import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Modal from '../common/Modal';
import { colors, spacing, typography, borderRadius } from '../../theme';

// A list of all months for our date picker
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CustomDatePicker = ({ visible, onClose, onSelect, initialDate }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  
  // Get current date for minimum date validation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Set up initial values for year, month, day
  const [year, setYear] = useState(selectedDate.getFullYear());
  const [month, setMonth] = useState(selectedDate.getMonth());
  const [day, setDay] = useState(selectedDate.getDate());
  
  // Calculate valid years (current year to current year + 5)
  const years = Array.from({ length: 6 }, (_, i) => today.getFullYear() + i);
  
  // Calculate days in the selected month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Determine if a date is selectable (not in the past)
  const isValidDate = (y, m, d) => {
    const checkDate = new Date(y, m, d);
    return checkDate >= today;
  };
  
  // Update selected date when year, month, or day changes
  useEffect(() => {
    // Create new date from selected components
    const newDate = new Date(year, month, day);
    
    // Adjust day if it exceeds days in month
    if (day > daysInMonth) {
      setDay(daysInMonth);
      newDate.setDate(daysInMonth);
    }
    
    setSelectedDate(newDate);
  }, [year, month, day, daysInMonth]);
  
  // Confirm selection
  const handleConfirm = () => {
    onSelect(selectedDate);
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Select Deadline Date"
    >
      <View style={styles.container}>
        <View style={styles.dateDisplay}>
          <Text style={styles.dateText}>
            {MONTHS[month]} {day}, {year}
          </Text>
        </View>
        
        <View style={styles.pickerRow}>
          {/* Month Picker */}
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Month</Text>
            <FlatList
              data={MONTHS}
              keyExtractor={(item, index) => `month-${index}`}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    month === index && styles.selectedItem,
                    !isValidDate(year, index, day) && styles.disabledItem
                  ]}
                  onPress={() => isValidDate(year, index, day) && setMonth(index)}
                  disabled={!isValidDate(year, index, day)}
                >
                  <Text 
                    style={[
                      styles.pickerItemText,
                      month === index && styles.selectedItemText,
                      !isValidDate(year, index, day) && styles.disabledItemText
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.pickerList}
            />
          </View>
          
          {/* Day Picker */}
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Day</Text>
            <FlatList
              data={days}
              keyExtractor={(item) => `day-${item}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    day === item && styles.selectedItem,
                    !isValidDate(year, month, item) && styles.disabledItem
                  ]}
                  onPress={() => isValidDate(year, month, item) && setDay(item)}
                  disabled={!isValidDate(year, month, item)}
                >
                  <Text 
                    style={[
                      styles.pickerItemText,
                      day === item && styles.selectedItemText,
                      !isValidDate(year, month, item) && styles.disabledItemText
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.pickerList}
            />
          </View>
          
          {/* Year Picker */}
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Year</Text>
            <FlatList
              data={years}
              keyExtractor={(item) => `year-${item}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    year === item && styles.selectedItem
                  ]}
                  onPress={() => setYear(item)}
                >
                  <Text 
                    style={[
                      styles.pickerItemText,
                      year === item && styles.selectedItemText
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.pickerList}
            />
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.confirmButton]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  dateDisplay: {
    backgroundColor: '#f5f5f5',
    padding: spacing.sm,
    borderRadius: borderRadius.small,
    marginBottom: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  dateText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    width: '100%',
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  pickerLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.dark,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  pickerList: {
    height: 150,
  },
  pickerItem: {
    padding: spacing.sm,
    marginVertical: 2,
    alignItems: 'center',
    borderRadius: borderRadius.small,
    backgroundColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: colors.accent,
  },
  disabledItem: {
    backgroundColor: '#e0e0e0',
    opacity: 0.5,
  },
  pickerItemText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.dark,
  },
  selectedItemText: {
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  disabledItemText: {
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.large,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: colors.secondary,
  },
  cancelButtonText: {
    color: colors.text.dark,
    fontWeight: typography.fontWeights.bold,
  },
  confirmButtonText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeights.bold,
  },
});

export default CustomDatePicker;