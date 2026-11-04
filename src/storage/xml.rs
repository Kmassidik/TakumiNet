pub(crate) const MAX_FILE_BYTES: usize = 8 * 1024 * 1024;
pub(crate) const MAX_RECORDS: usize = 20_000;
pub(crate) const MAX_DEPTH: usize = 8;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Element {
    pub name: String,
    pub attributes: Vec<(String, String)>,
    pub children: Vec<Element>,
    pub line: usize,
}

impl Element {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            attributes: Vec::new(),
            children: Vec::new(),
            line: 0,
        }
    }

    pub fn get(&self, name: &str) -> Option<&str> {
        self.attributes
            .iter()
            .find(|(key, _)| key == name)
            .map(|(_, value)| value.as_str())
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct XmlError {
    pub line: usize,
    pub element: String,
    pub attribute: String,
    pub message: String,
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
    let mut out = format!("<takumi version=\"{}\">\n", escape(version));
    for element in elements {
        write_element(&mut out, element);
    }
    out.push_str("</takumi>\n");
    out
}

fn write_element(out: &mut String, element: &Element) {
    out.push('<');
    out.push_str(&element.name);
    for (name, value) in &element.attributes {
        out.push(' ');
        out.push_str(name);
        out.push_str("=\"");
        out.push_str(&escape(value));
        out.push('"');
    }
    if element.children.is_empty() {
        out.push_str("/>\n");
        return;
    }
    out.push('>');
    for child in &element.children {
        write_element(out, child);
        // Do not introduce significant whitespace into unknown nested XML.
        out.pop();
    }
    out.push_str("</");
    out.push_str(&element.name);
    out.push_str(">\n");
}

/// The root element of a workspace file: the current name first, then the name used before the rename.
const ROOT_NAMES: [&str; 2] = ["takumi", "takuminet"];

pub fn read(text: &str) -> Result<(String, Vec<Element>), XmlError> {
    if text.len() > MAX_FILE_BYTES {
        return Err(XmlError {
            line: 1,
            element: "takumi".into(),
            attribute: "file".into(),
            message: "file exceeds the 8 MB limit".into(),
        });
    }
    if let Some(at) = text.find("<!") {
        let declaration = text[at..].get(..9).unwrap_or(&text[at..]);
        return Err(XmlError {
            line: line_at(text.as_bytes(), at),
            element: "takumi".into(),
            attribute: "DTD".into(),
            message: if declaration.starts_with("<!DOCTYPE") || declaration.starts_with("<!ENTITY") {
                "DTD and entity definitions are forbidden".into()
            } else {
                "XML declarations are not supported".into()
            },
        });
    }

    let mut parser = Parser { bytes: text.as_bytes(), position: 0 };
    parser.whitespace();
    let root = parser.tag("takumi")?;
    // Files saved before the rename start with <takuminet>; they still open.
    if !ROOT_NAMES.contains(&root.name.as_str()) || root.self_closing {
        return Err(parser.error_at(root.line, &root.name, "element", "expected a non-empty <takumi> root"));
    }
    let Some(version) = root.attributes.iter()
        .find(|(key, _)| key == "version")
        .map(|(_, value)| value.clone())
    else {
        return Err(parser.error_at(root.line, "takumi", "version", "missing schema version"));
    };

    let root_name = root.name.clone();
    let mut elements = Vec::new();
    let mut stack: Vec<Element> = Vec::new();
    let mut records = 0usize;
    loop {
        parser.whitespace();
        if parser.position == parser.bytes.len() {
            let element = stack.last().map(|e| e.name.as_str()).unwrap_or("takumi");
            return Err(parser.error(element, "element", "unexpected end of file"));
        }
        if parser.consume(b"</") {
            let line = parser.line();
            let name = parser.name("closing element")?;
            parser.whitespace();
            if !parser.consume(b">") {
                return Err(parser.error_at(line, &name, "element", "malformed closing tag"));
            }
            if stack.is_empty() {
                if name != root_name {
                    return Err(parser.error_at(line, &name, "element", "unexpected closing tag"));
                }
                parser.whitespace();
                if parser.position != parser.bytes.len() {
                    return Err(parser.error("takumi", "element", "content after the root element"));
                }
                return Ok((version, elements));
            }
            let completed = stack.pop().expect("checked non-empty");
            if completed.name != name {
                return Err(parser.error_at(line, &name, "element", format!("closing tag does not match <{}>", completed.name)));
            }
            if let Some(parent) = stack.last_mut() {
                parent.children.push(completed);
            } else {
                elements.push(completed);
            }
            continue;
        }

        let context = stack.last().map(|e| e.name.as_str()).unwrap_or("takumi");
        let tag = parser.tag(context)?;
        let depth = stack.len() + 2;
        if depth > MAX_DEPTH {
            return Err(parser.error_at(tag.line, &tag.name, "nesting", "XML nesting exceeds depth 8"));
        }
        records += 1;
        if records > MAX_RECORDS {
            return Err(parser.error_at(tag.line, &tag.name, "records", "file exceeds the 20,000 record limit"));
        }
        let element = Element {
            name: tag.name,
            attributes: tag.attributes,
            children: Vec::new(),
            line: tag.line,
        };
        if tag.self_closing {
            if let Some(parent) = stack.last_mut() {
                parent.children.push(element);
            } else {
                elements.push(element);
            }
        } else {
            stack.push(element);
        }
    }
}

fn line_at(bytes: &[u8], position: usize) -> usize {
    1 + bytes[..position.min(bytes.len())].iter().filter(|byte| **byte == b'\n').count()
}

struct Tag {
    name: String,
    attributes: Vec<(String, String)>,
    self_closing: bool,
    line: usize,
}

struct Parser<'a> {
    bytes: &'a [u8],
    position: usize,
}

impl Parser<'_> {
    fn line(&self) -> usize {
        line_at(self.bytes, self.position)
    }

    fn error(&self, element: &str, attribute: &str, message: impl Into<String>) -> XmlError {
        self.error_at(self.line(), element, attribute, message)
    }

    fn error_at(&self, line: usize, element: &str, attribute: &str, message: impl Into<String>) -> XmlError {
        XmlError {
            line: line.max(1),
            element: element.to_string(),
            attribute: attribute.to_string(),
            message: message.into(),
        }
    }

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

    fn name(&mut self, context: &str) -> Result<String, XmlError> {
        let start = self.position;
        while self.bytes.get(self.position).is_some_and(|byte| {
            byte.is_ascii_alphanumeric() || matches!(byte, b'_' | b'-' | b'.' | b':')
        }) {
            self.position += 1;
        }
        if self.position == start {
            return Err(self.error(context, "element", "expected an XML name"));
        }
        std::str::from_utf8(self.bytes.get(start..self.position).expect("in bounds"))
            .map(str::to_string)
            .map_err(|_| self.error(context, "element", "element name is not UTF-8"))
    }

    fn tag(&mut self, context: &str) -> Result<Tag, XmlError> {
        let line = self.line();
        if !self.consume(b"<") || self.bytes.get(self.position) == Some(&b'/') {
            return Err(self.error_at(line, context, "element", "expected an opening tag"));
        }
        let name = self.name(context)?;
        let mut attributes = Vec::new();
        loop {
            let before_space = self.position;
            self.whitespace();
            let spaced = self.position != before_space;
            if self.consume(b"/>") {
                return Ok(Tag { name, attributes, self_closing: true, line });
            }
            if self.consume(b">") {
                return Ok(Tag { name, attributes, self_closing: false, line });
            }
            if !spaced {
                return Err(self.error_at(line, &name, "element", "expected whitespace, '>', or '/>'"));
            }
            let key = self.name(&name)?;
            self.whitespace();
            if !self.consume(b"=") {
                return Err(self.error_at(line, &name, &key, "expected '=' after attribute name"));
            }
            self.whitespace();
            if !self.consume(b"\"") {
                return Err(self.error_at(line, &name, &key, "attribute value must be double quoted"));
            }
            let start = self.position;
            while self.bytes.get(self.position).is_some_and(|byte| *byte != b'"') {
                if self.bytes[self.position] == b'<' {
                    return Err(self.error_at(line, &name, &key, "'<' is not allowed in an attribute value"));
                }
                self.position += 1;
            }
            if self.position == self.bytes.len() {
                return Err(self.error_at(line, &name, &key, "unterminated attribute value"));
            }
            let raw = std::str::from_utf8(&self.bytes[start..self.position])
                .map_err(|_| self.error_at(line, &name, &key, "attribute value is not UTF-8"))?;
            let value = unescape(raw)
                .ok_or_else(|| self.error_at(line, &name, &key, "only the five named and numeric XML references are allowed"))?;
            self.consume(b"\"");
            if attributes.iter().any(|(existing, _)| existing == &key) {
                return Err(self.error_at(line, &name, &key, "duplicate attribute"));
            }
            attributes.push((key, value));
        }
    }
}
