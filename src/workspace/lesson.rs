use super::*;

pub(super) const CHECK_KINDS: &[&str] = &["ping", "ttl", "http", "lease", "arp", "route"];

impl Workspace {
    pub(super) fn load_lesson_line(&mut self, f: &[&str]) -> Option<()> {
        match f {
            ["lesson", id, title, level, minutes, goal] => {
                self.lesson = Some(Lesson {
                    id: unescape_field(id),
                    title: unescape_field(title),
                    level: level.parse().ok()?,
                    minutes: minutes.parse().ok()?,
                    goal: unescape_field(goal),
                    steps: Vec::new(),
                    checks: Vec::new(),
                });
            }
            ["step", n, text] => {
                self.lesson.as_mut()?.steps.push(LessonStep {
                    n: n.parse().ok()?,
                    text: unescape_field(text),
                });
            }
            ["check", id, kind, from, to, url, expect, label] => {
                self.lesson.as_mut()?.checks.push(Check {
                    id: unescape_field(id),
                    kind: kind.to_string(),
                    from: unescape_field(from),
                    to: unescape_field(to),
                    url: unescape_field(url),
                    expect: unescape_field(expect),
                    label: unescape_field(label),
                });
            }
            _ => {}
        }
        Some(())
    }

    pub(super) fn sort_lesson_steps(&mut self) {
        if let Some(lesson) = &mut self.lesson {
            lesson.steps.sort_by_key(|step| step.n);
        }
    }

    pub(super) fn write_lesson(&self, out: &mut String) {
        let Some(lesson) = &self.lesson else { return };
        out.push_str(&format!(
            "lesson\t{}\t{}\t{}\t{}\t{}\n",
            escape_field(&lesson.id),
            escape_field(&lesson.title),
            lesson.level,
            lesson.minutes,
            escape_field(&lesson.goal),
        ));
        for step in &lesson.steps {
            out.push_str(&format!("step\t{}\t{}\n", step.n, escape_field(&step.text)));
        }
        for check in &lesson.checks {
            out.push_str(&format!(
                "check\t{}\t{}\t{}\t{}\t{}\t{}\t{}\n",
                escape_field(&check.id),
                escape_field(&check.kind),
                escape_field(&check.from),
                escape_field(&check.to),
                escape_field(&check.url),
                escape_field(&check.expect),
                escape_field(&check.label),
            ));
        }
    }

    pub(super) fn lesson_json(&self, out: &mut String) {
        let Some(lesson) = &self.lesson else {
            out.push_str("null");
            return;
        };
        out.push_str(&format!(
            "{{\"id\":{},\"title\":{},\"level\":{},\"minutes\":{},\"goal\":{},\"steps\":[",
            s(&lesson.id), s(&lesson.title), lesson.level, lesson.minutes, s(&lesson.goal),
        ));
        for (index, step) in lesson.steps.iter().enumerate() {
            if index > 0 { out.push(','); }
            out.push_str(&format!("{{\"n\":{},\"text\":{}}}", step.n, s(&step.text)));
        }
        out.push_str("],\"checks\":[");
        for (index, check) in lesson.checks.iter().enumerate() {
            if index > 0 { out.push(','); }
            out.push_str(&format!(
                "{{\"id\":{},\"kind\":{},\"from\":{},\"to\":{},\"url\":{},\"expect\":{},\"label\":{}}}",
                s(&check.id), s(&check.kind), s(&check.from), s(&check.to),
                s(&check.url), s(&check.expect), s(&check.label),
            ));
        }
        out.push_str("]}");
    }
}
