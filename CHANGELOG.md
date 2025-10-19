# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of inquirer-snippet-question
- Interactive field navigation with arrow keys and tab
- Live template preview with real-time updates
- Field editing with cursor visualization
- Form validation support with custom validation functions
- Customizable themes with ANSI color support
- TypeScript support with comprehensive type definitions
- Required field support for validation
- Default/initial values for fields
- Keyboard shortcuts for efficient navigation
- Visual indicators for different field states
- Context-sensitive help text
- Error handling and user cancellation support

### Features
- **Navigation**: Arrow keys (↑/↓), Tab, Enter for field selection and editing
- **Editing**: Real-time preview with cursor position indication
- **Submission**: Ctrl+S to submit completed form
- **Validation**: Synchronous and asynchronous validation support
- **Themes**: Five built-in themes (default, colorful, minimal, high-contrast, retro, professional)
- **Accessibility**: High contrast theme and keyboard-only navigation
- **TypeScript**: Full type safety with exported interfaces and types

### Technical Details
- Built on @inquirer/core ^10.0.0
- Uses ANSI escape sequences for styling and cursor control
- Supports both CommonJS and ES modules
- Comprehensive test suite with Jest
- ESLint and Prettier configuration for code quality
- Husky pre-commit hooks for automated checks

### Documentation
- Comprehensive README with examples and API documentation
- Detailed API reference in API.md
- Multiple example files demonstrating various use cases
- TypeScript declaration files with JSDoc comments
- Migration guide from Enquirer's snippet prompt

### Examples Included
- Basic usage with email and React component templates
- Advanced validation patterns
- Custom theme implementations
- Database configuration forms
- API endpoint configuration
- Business proposal generation
- User registration forms
- GitHub issue templates

## [Unreleased]

### Planned Features
- Multi-line field editing support
- Field dependencies and conditional display
- Import/export of templates and configurations
- Plugin system for custom field types
- Integration with popular template engines
- Improved accessibility features
- Performance optimizations for large templates
- Additional built-in themes
- Template validation and linting
- Auto-completion for field values

### Known Issues
- None currently reported

## Development

### Version 1.0.0 Development Timeline
- **Planning Phase**: Requirements gathering and API design
- **Core Implementation**: Basic prompt functionality and navigation
- **Theme System**: Customizable styling and visual feedback
- **Validation**: Form validation and error handling
- **Documentation**: Comprehensive docs and examples
- **Testing**: Unit tests and integration tests
- **Polish**: Code quality, performance, and accessibility improvements

### Contributors
- Initial development and design
- Documentation and examples
- Testing and quality assurance
- Theme design and accessibility review

### Dependencies
- @inquirer/core: ^10.3.0 - Core prompt functionality
- @inquirer/type: ^3.0.9 - TypeScript utilities

### Development Dependencies
- TypeScript: ^5.9.3 - Type checking and compilation
- Jest: ^29.7.0 - Testing framework
- ESLint: ^9.38.0 - Code linting
- Prettier: ^3.6.2 - Code formatting
- Husky: ^9.1.7 - Git hooks
- Various other development tools and configurations

## Migration Notes

### From Enquirer's Snippet
If migrating from Enquirer's snippet prompt:

1. **Package Installation**: Replace `enquirer` with `inquirer-snippet-question`
2. **Import Statement**: Change import from `{ snippet }` to default import
3. **Configuration**: 
   - Rename `initial` property to `template`
   - Convert `fields` array to object with field names as keys
   - Update field configuration structure
4. **Validation**: Adapt validation function to receive all values at once
5. **Theming**: Update theme configuration to new format

### Breaking Changes from Pre-1.0
- N/A (initial release)

## Support

### Compatibility
- Node.js 14+ required
- Compatible with modern terminals supporting ANSI escape sequences
- Works with both CommonJS and ES modules
- TypeScript 4.5+ recommended for full type support

### Browser Support
- Not applicable (terminal-based tool)

### Platform Support
- ✅ macOS
- ✅ Linux
- ✅ Windows (with compatible terminal)
- ✅ WSL (Windows Subsystem for Linux)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Enquirer's snippet prompt
- Built on the solid foundation of @inquirer/core
- Thanks to the Inquirer.js community for feedback and suggestions
- ANSI color codes reference from various terminal documentation sources