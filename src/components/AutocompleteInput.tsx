import React, {useState, useMemo} from 'react';
import {Box, Text, useInput} from 'ink';
import TextInput from 'ink-text-input';

interface AutocompleteInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (value: string) => void;
	placeholder?: string;
	suggestions: string[];
	maxSuggestions?: number;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
	value,
	onChange,
	onSubmit,
	placeholder,
	suggestions,
	maxSuggestions = 10,
}) => {
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

	// Filter and sort suggestions based on current input
	const filteredSuggestions = useMemo(() => {
		if (!value.trim()) {
			return [];
		}

		const input = value.toLowerCase();
		const filtered = suggestions
			.filter(suggestion => suggestion.toLowerCase().includes(input))
			.sort((a, b) => {
				// Prioritize exact matches and prefix matches
				const aLower = a.toLowerCase();
				const bLower = b.toLowerCase();

				// Exact match first
				if (aLower === input) return -1;
				if (bLower === input) return 1;

				// Prefix match second
				const aStartsWith = aLower.startsWith(input);
				const bStartsWith = bLower.startsWith(input);
				if (aStartsWith && !bStartsWith) return -1;
				if (bStartsWith && !aStartsWith) return 1;

				// Alphabetical order for remaining
				return a.localeCompare(b);
			})
			.slice(0, maxSuggestions);

		return filtered;
	}, [value, suggestions, maxSuggestions]);

	// Reset selection when suggestions change
	React.useEffect(() => {
		setSelectedSuggestionIndex(0);
	}, [filteredSuggestions]);

	useInput((input, key) => {
		if (!showSuggestions || filteredSuggestions.length === 0) {
			return;
		}

		if (key.tab) {
			// Tab: select current suggestion
			const selectedSuggestion = filteredSuggestions[selectedSuggestionIndex];
			if (selectedSuggestion) {
				onChange(selectedSuggestion);
				setShowSuggestions(false);
			}
		} else if (key.downArrow) {
			// Down arrow: move to next suggestion
			setSelectedSuggestionIndex(prev =>
				prev < filteredSuggestions.length - 1 ? prev + 1 : 0,
			);
		} else if (key.upArrow) {
			// Up arrow: move to previous suggestion
			setSelectedSuggestionIndex(prev =>
				prev > 0 ? prev - 1 : filteredSuggestions.length - 1,
			);
		} else if (key.escape) {
			// Escape: hide suggestions
			setShowSuggestions(false);
		}
	});

	const handleInputChange = (newValue: string) => {
		onChange(newValue);
		setShowSuggestions(newValue.trim().length > 0);
	};

	const handleInputSubmit = (submittedValue: string) => {
		setShowSuggestions(false);
		onSubmit(submittedValue);
	};

	return (
		<Box flexDirection="column">
			<TextInput
				value={value}
				onChange={handleInputChange}
				onSubmit={handleInputSubmit}
				placeholder={placeholder}
			/>

			{showSuggestions && filteredSuggestions.length > 0 && (
				<Box flexDirection="column" marginTop={1}>
					<Text dimColor>↑↓ navigate • Tab to select • Esc to close</Text>
					<Box flexDirection="column" marginLeft={2}>
						{filteredSuggestions.map((suggestion, index) => (
							<Text
								key={suggestion}
								color={index === selectedSuggestionIndex ? 'cyan' : 'white'}
								backgroundColor={
									index === selectedSuggestionIndex ? 'blue' : undefined
								}
							>
								{suggestion}
							</Text>
						))}
					</Box>
				</Box>
			)}

			{!showSuggestions && value.trim() && filteredSuggestions.length === 0 && (
				<Box marginTop={1}>
					<Text dimColor>No matching branches found</Text>
				</Box>
			)}

			{!showSuggestions && !value.trim() && (
				<Box marginTop={1}>
					<Text dimColor>Type to search branches, Tab to autocomplete</Text>
				</Box>
			)}
		</Box>
	);
};

export default AutocompleteInput;
