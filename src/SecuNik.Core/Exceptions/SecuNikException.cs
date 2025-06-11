// File: src\SecuNik.Core\Exceptions\SecuNikException.cs
using System;

namespace SecuNik.Core.Exceptions
{
    /// <summary>
    /// Base exception for SecuNik operations
    /// </summary>
    public class SecuNikException : Exception
    {
        public SecuNikException(string message) : base(message) { }
        public SecuNikException(string message, Exception innerException) : base(message, innerException) { }
    }

    /// <summary>
    /// Exception for unsupported file types
    /// </summary>
    public class UnsupportedFileTypeException : SecuNikException
    {
        public string FilePath { get; }
        public string FileType { get; }

        public UnsupportedFileTypeException(string filePath, string fileType)
            : base($"File type '{fileType}' is not supported for file: {filePath}")
        {
            FilePath = filePath;
            FileType = fileType;
        }
    }

    /// <summary>
    /// Exception for file parsing errors
    /// </summary>
    public class FileParsingException : SecuNikException
    {
        public string FilePath { get; }

        public FileParsingException(string filePath, string message)
            : base($"Error parsing file '{filePath}': {message}")
        {
            FilePath = filePath;
        }

        public FileParsingException(string filePath, string message, Exception innerException)
            : base($"Error parsing file '{filePath}': {message}", innerException)
        {
            FilePath = filePath;
        }
    }

    /// <summary>
    /// Exception for AI analysis errors
    /// </summary>
    public class AIAnalysisException : SecuNikException
    {
        public AIAnalysisException(string message) : base(message) { }
        public AIAnalysisException(string message, Exception innerException) : base(message, innerException) { }
    }
}