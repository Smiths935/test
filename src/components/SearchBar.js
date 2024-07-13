import React from 'react';
import PropTypes from 'prop-types';
import './SearchBar.css';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
    return (
        <div className="search-bar">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search messages..."
            />
        </div>
    );
};

SearchBar.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    setSearchTerm: PropTypes.func.isRequired,
};

export default SearchBar;
