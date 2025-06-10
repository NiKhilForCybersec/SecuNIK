using System.IO;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using SecuNik.Core.Services;
using Xunit;

namespace SecuNik.Core.Tests;

public class ParserTests
{
    [Fact]
    public async Task WindowsEventLogParser_ParsesSimpleXml()
    {
        var path = Path.GetTempFileName() + ".evtx";
        await File.WriteAllTextAsync(path,
            "<Events><Event><System><EventID>1</EventID><TimeCreated SystemTime=\"2024-01-01T00:00:00Z\"/></System><EventData><Data>Test</Data></EventData></Event></Events>");
        var parser = new WindowsEventLogParser(new NullLogger<WindowsEventLogParser>());
        (await parser.CanParseAsync(path)).Should().BeTrue();
        var findings = await parser.ParseAsync(path);
        findings.SecurityEvents.Should().NotBeEmpty();
        File.Delete(path);
    }

    [Fact]
    public async Task LinuxSessionLogParser_ReadsLines()
    {
        var path = Path.GetTempFileName() + ".wtmp";
        await File.WriteAllTextAsync(path, "user pts/0 192.168.0.1 Fri May 1 10:00 still logged in\n");
        var parser = new LinuxSessionLogParser(new NullLogger<LinuxSessionLogParser>());
        (await parser.CanParseAsync(path)).Should().BeTrue();
        var findings = await parser.ParseAsync(path);
        findings.SecurityEvents.Should().NotBeEmpty();
        File.Delete(path);
    }

    [Fact]
    public async Task WebServerLogParser_ParsesApacheLine()
    {
        var path = Path.GetTempFileName() + ".log";
        await File.WriteAllTextAsync(path, "127.0.0.1 - - [10/Oct/2000:13:55:36 -0700] \"GET /index.html HTTP/1.0\" 200 2326\n");
        var parser = new WebServerLogParser(new NullLogger<WebServerLogParser>());
        (await parser.CanParseAsync(path)).Should().BeTrue();
        var findings = await parser.ParseAsync(path);
        findings.SecurityEvents.Should().NotBeEmpty();
        File.Delete(path);
    }

    [Fact]
    public async Task NetworkCaptureParser_ProcessesFile()
    {
        var path = Path.GetTempFileName() + ".pcap";
        await File.WriteAllBytesAsync(path, new byte[] {0x00,0x01,0x02});
        var parser = new NetworkCaptureParser(new NullLogger<NetworkCaptureParser>());
        (await parser.CanParseAsync(path)).Should().BeTrue();
        var findings = await parser.ParseAsync(path);
        findings.SecurityEvents.Should().NotBeEmpty();
        File.Delete(path);
    }

    [Fact]
    public async Task SyslogParser_ParsesLine()
    {
        var path = Path.GetTempFileName() + ".syslog";
        await File.WriteAllTextAsync(path, "Jan 10 12:00:00 localhost sshd: Accepted password for user from 1.2.3.4 port 22 ssh2\n");
        var parser = new SyslogParser(new NullLogger<SyslogParser>());
        (await parser.CanParseAsync(path)).Should().BeTrue();
        var findings = await parser.ParseAsync(path);
        findings.SecurityEvents.Should().NotBeEmpty();
        File.Delete(path);
    }

    [Fact]
    public async Task FirewallLogParser_ParsesDropLine()
    {
        var path = Path.GetTempFileName() + ".fwlog";
        await File.WriteAllTextAsync(path, "DROP IN=eth0 SRC=1.1.1.1 DST=2.2.2.2\n");
        var parser = new FirewallLogParser(new NullLogger<FirewallLogParser>());
        (await parser.CanParseAsync(path)).Should().BeTrue();
        var findings = await parser.ParseAsync(path);
        findings.SecurityEvents.Should().NotBeEmpty();
        File.Delete(path);
    }

    [Fact]
    public async Task DatabaseLogParser_ParsesErrorLine()
    {
        var path = Path.GetTempFileName() + ".dblog";
        await File.WriteAllTextAsync(path, "2025-06-10T12:00:00Z [ERROR] database crashed\n");
        var parser = new DatabaseLogParser(new NullLogger<DatabaseLogParser>());
        (await parser.CanParseAsync(path)).Should().BeTrue();
        var findings = await parser.ParseAsync(path);
        findings.SecurityEvents.Should().NotBeEmpty();
        File.Delete(path);
    }

    [Fact]
    public async Task MailServerLogParser_ParsesLine()
    {
        var path = Path.GetTempFileName() + ".maillog";
        await File.WriteAllTextAsync(path, "Jan 10 12:00:00 mail postfix/smtpd[1234]: connect from 1.2.3.4\n");
        var parser = new MailServerLogParser(new NullLogger<MailServerLogParser>());
        (await parser.CanParseAsync(path)).Should().BeTrue();
        var findings = await parser.ParseAsync(path);
        findings.SecurityEvents.Should().NotBeEmpty();
        File.Delete(path);
    }

    [Fact]
    public async Task DnsLogParser_ParsesLine()
    {
        var path = Path.GetTempFileName() + ".dnslog";
        await File.WriteAllTextAsync(path, "10-Jun-2025 12:00:00.000 client 1.1.1.1#12345: query: example.com IN A +\n");
        var parser = new DnsLogParser(new NullLogger<DnsLogParser>());
        (await parser.CanParseAsync(path)).Should().BeTrue();
        var findings = await parser.ParseAsync(path);
        findings.SecurityEvents.Should().NotBeEmpty();
        File.Delete(path);
    }
}
