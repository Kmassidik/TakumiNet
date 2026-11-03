#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Element {
    pub name: String,
    pub attributes: Vec<(String, String)>,
}

impl Element {
    pub fn new(name: &str) -> Self {
        Self { name: name.to_string(), attributes: Vec::new() }
    }

    pub fn get(&self, name: &str) -> Option<&str> {
        self.attributes
            .iter()
            .find(|(key, _)| key == name)
            .map(|(_, value)| value.as_str())
    }
}

pub fn escape(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for c in value.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&apos;"),
            '\t' => out.push_str("&#9;"),
            '\r' => out.push_str("&#13;"),
            '\n' => out.push_str("&#10;"),
            _ => out.push(c),
        }
    }
    out
}

pub fn unescape(value: &str) -> Option<String> {
    let mut out = String::with_capacity(value.len());
    let mut rest = value;
    while let Some(ampersand) = rest.find('&') {
        out.push_str(&rest[..ampersand]);
        rest = &rest[ampersand + 1..];
        let semicolon = rest.find(';')?;
        let reference = &rest[..semicolon];
        match reference {
            "amp" => out.push('&'),
            "lt" => out.push('<'),
            "gt" => out.push('>'),
            "quot" => out.push('"'),
            "apos" => out.push('\''),
            _ => {
                let digits = reference.strip_prefix("#x").or_else(|| reference.strip_prefix("#X"));
                let c = if let Some(hex) = digits {
                    if hex.is_empty() {
                        return None;
                    }
                    char::from_u32(u32::from_str_radix(hex, 16).ok()?)?
                } else if let Some(decimal) = reference.strip_prefix('#') {
                    if decimal.is_empty() {
                        return None;
                    }
                    char::from_u32(decimal.parse::<u32>().ok()?)?
                } else {
                    return None;
                };
                out.push(c);
            }
        }
        rest = &rest[semicolon + 1..];
    }
    out.push_str(rest);
    Some(out)
}

pub fn write(version: &str, elements: &[Element]) -> String {
    let mut out = format!("<takuminet version=\"{}\">\n", escape(version));
    for element in elements {
        out.push('<');
        out.push_str(&element.name);
        for (name, value) in &element.attributes {
            out.push(' ');
            out.push_str(name);
            out.push_str("=\"");
            out.push_str(&escape(value));
            out.push('"');
        }
        out.push_str("/>\n");
    }
    out.push_str("</takuminet>\n");
    out
}

pub fn read(text: &str) -> Option<(String, Vec<Element>)> {
    let mut parser = Parser { bytes: text.as_bytes(), position: 0 };
    parser.whitespace();
    let (name, attributes, self_closing) = parser.tag()?;
    if name != "takuminet" || self_closing {
        return None;
    }
    let version = attributes
        .iter()
        .find(|(key, _)| key == "version")
        .map(|(_, value)| value.clone())?;
    let mut elements = Vec::new();
    loop {
        parser.whitespace();
        if parser.consume(b"</takuminet>") {
            parser.whitespace();
            return (parser.position == parser.bytes.len()).then_some((version, elements));
        }
        let (name, attributes, self_closing) = parser.tag()?;
        if !self_closing {
            return None;
        }
        elements.push(Element { name, attributes });
    }
}

struct Parser<'a> {
    bytes: &'a [u8],
    position: usize,
}

impl Parser<'_> {
    fn whitespace(&mut self) {
        while self
            .bytes
            .get(self.position)
            .is_some_and(|byte| matches!(byte, b' ' | b'\t' | b'\r' | b'\n'))
        {
            self.position += 1;
        }
    }

    fn consume(&mut self, token: &[u8]) -> bool {
        if self.bytes.get(self.position..).is_some_and(|rest| rest.starts_with(token)) {
            self.position += token.len();
            true
        } else {
            false
        }
    }

    fn name(&mut self) -> Option<String> {
        let start = self.position;
        while self.bytes.get(self.position).is_some_and(|byte| {
            byte.is_ascii_alphanumeric() || matches!(byte, b'_' | b'-' | b'.' | b':')
        }) {
            self.position += 1;
        }
        if self.position == start {
            return None;
        }
        std::str::from_utf8(self.bytes.get(start..self.position)?)
            .ok()
            .map(str::to_string)
    }

    fn tag(&mut self) -> Option<(String, Vec<(String, String)>, bool)> {
        if !self.consume(b"<") || self.bytes.get(self.position) == Some(&b'/') {
            return None;
        }
        let name = self.name()?;
        let mut attributes = Vec::new();
        loop {
            let before_space = self.position;
            self.whitespace();
            let spaced = self.position != before_space;
            if self.consume(b"/>") {
                return Some((name, attributes, true));
            }
            if self.consume(b">") {
                return Some((name, attributes, false));
            }
            if !spaced {
                return None;
            }
            let key = self.name()?;
            self.whitespace();
            if !self.consume(b"=") {
                return None;
            }
            self.whitespace();
            if !self.consume(b"\"") {
                return None;
            }
            let start = self.position;
            while self.bytes.get(self.position).is_some_and(|byte| *byte != b'"') {
                if *self.bytes.get(self.position)? == b'<' {
                    return None;
                }
                self.position += 1;
            }
            let raw = std::str::from_utf8(self.bytes.get(start..self.position)?).ok()?;
            let value = unescape(raw)?;
            if !self.consume(b"\"") {
                return None;
            }
            if attributes.iter().any(|(existing, _)| existing == &key) {
                return None;
            }
            attributes.push((key, value));
        }
    }
}
