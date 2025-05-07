import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Modal from '../../components/common/Modal';
import { colors, spacing, typography, borderRadius } from '../../theme';

// Constants
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MonthYearPicker = ({ visible, onClose, onSelect, initialYear, initialMonth }) => {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  
  // Generate year range (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  const handleConfirm = () => {
    onSelect(selectedYear, selectedMonth);
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Select Month and Year"
    >
      <View style={styles.container}>
        {/* Month Selection */}
        <Text style={styles.sectionTitle}>Month</Text>
        <FlatList
          data={MONTHS}
          numColumns={3}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.item,
                selectedMonth === index && styles.selectedItem
              ]}
              onPress={() => setSelectedMonth(index)}
            >
              <Text 
                style={[
                  styles.itemText,
                  selectedMonth === index && styles.selectedItemText
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.list}
        />
        
        {/* Year Selection */}
        <Text style={styles.sectionTitle}>Year</Text>
        <FlatList
          data={years}
          horizontal={true}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.yearItem,
                selectedYear === item && styles.selectedItem
              ]}
              onPress={() => setSelectedYear(item)}
            >
              <Text 
                style={[
                  styles.itemText,
                  selectedYear === item && styles.selectedItemText
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.yearList}
        />
        
        {/* Action Buttons */}
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
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.dark,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  list: {
    maxHeight: 200,
  },
  yearList: {
    maxHeight: 60,
  },
  item: {
    flex: 1,
    minWidth: '30%',
    padding: spacing.sm,
    margin: 3,
    alignItems: 'center',
    borderRadius: borderRadius.small,
    backgroundColor: '#f0f0f0',
  },
  yearItem: {
    padding: spacing.sm,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    borderRadius: borderRadius.small,
    backgroundColor: '#f0f0f0',
    minWidth: 60,
  },
  selectedItem: {
    backgroundColor: colors.accent,
  },
  itemText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.dark,
  },
  selectedItemText: {
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
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

export default MonthYearPicker;