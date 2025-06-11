using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using SecuNik.API.Controllers;
using SecuNik.Core.Interfaces;
using SecuNik.Core.Models;
using Xunit;

public class MultiUploadTests
{
    [Fact]
    public async Task UploadMultiple_CallsEngine()
    {
        var mockEngine = new Mock<IAnalysisEngine>();
        mockEngine.Setup(e => e.CanProcessFileAsync(It.IsAny<string>())).ReturnsAsync(true);
        mockEngine.Setup(e => e.AnalyzeFilesAsync(It.IsAny<IEnumerable<AnalysisRequest>>()))
            .ReturnsAsync(new AnalysisResult { Technical = new TechnicalFindings() });
        mockEngine.Setup(e => e.GetSupportedFileTypesAsync()).ReturnsAsync(new List<string> { ".log" });

        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string>()).Build();
        var controller = new AnalysisController(mockEngine.Object, new NullLogger<AnalysisController>(), config);

        var ms = new MemoryStream(Encoding.UTF8.GetBytes("test"));
        var file = new FormFile(ms, 0, ms.Length, "file", "test.log");
        var files = new FormFileCollection { file, file };

        var result = await controller.UploadMultiple(files, null, new AnalysisOptionsDto());

        result.Should().BeOfType<OkObjectResult>();
        mockEngine.Verify(e => e.AnalyzeFilesAsync(It.IsAny<IEnumerable<AnalysisRequest>>()), Times.Once());
    }
}
