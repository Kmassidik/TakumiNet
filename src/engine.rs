use crate::http;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EngineResponse {
    pub status: u16,
    pub content_type: &'static str,
    pub body: Vec<u8>,
}

pub struct Engine {
    ctx: http::Ctx,
}

impl Default for Engine {
    fn default() -> Self {
        Self::new()
    }
}

impl Engine {
    pub fn new() -> Self {
        #[cfg(not(target_arch = "wasm32"))]
        let web_root = concat!(env!("CARGO_MANIFEST_DIR"), "/web");
        #[cfg(target_arch = "wasm32")]
        let web_root = "";
        Self { ctx: http::Ctx::new(web_root) }
    }

    pub fn handle(&self, method: &str, target: &str, body: &[u8]) -> EngineResponse {
        let (status, content_type, body) = http::dispatch(&self.ctx, method, target, body);
        EngineResponse { status, content_type, body }
    }

    /// Decode the raw ABI request without exposing Rust layout to JavaScript.
    pub fn handle_bytes(&self, request: &[u8]) -> EngineResponse {
        if request.len() < 8 {
            return bad_request();
        }
        let method_len = u16::from_le_bytes([request[0], request[1]]) as usize;
        let target_len = u16::from_le_bytes([request[2], request[3]]) as usize;
        let body_len = u32::from_le_bytes([request[4], request[5], request[6], request[7]]) as usize;
        let target_start = 8usize.checked_add(method_len);
        let body_start = target_start.and_then(|start| start.checked_add(target_len));
        let end = body_start.and_then(|start| start.checked_add(body_len));
        let (Some(target_start), Some(body_start), Some(end)) = (target_start, body_start, end) else {
            return bad_request();
        };
        if end != request.len() {
            return bad_request();
        }
        let (Ok(method), Ok(target)) = (
            std::str::from_utf8(&request[8..target_start]),
            std::str::from_utf8(&request[target_start..body_start]),
        ) else {
            return bad_request();
        };
        self.handle(method, target, &request[body_start..end])
    }
}

fn bad_request() -> EngineResponse {
    EngineResponse {
        status: 400,
        content_type: "application/json",
        body: b"{\"error\":\"malformed engine request\"}".to_vec(),
    }
}

#[cfg(target_arch = "wasm32")]
mod wasm {
    use super::*;
    use std::cell::RefCell;

    thread_local! {
        static ENGINE: RefCell<Engine> = RefCell::new(Engine::new());
    }

    #[no_mangle]
    pub extern "C" fn alloc(len: usize) -> *mut u8 {
        let boxed = vec![0u8; len].into_boxed_slice();
        Box::into_raw(boxed) as *mut u8
    }

    /// Release either a request allocation or a complete length-prefixed response.
    ///
    /// # Safety
    /// `ptr` must come from `alloc` or `handle`, and `len` must be its exact byte length.
    #[no_mangle]
    pub unsafe extern "C" fn dealloc(ptr: *mut u8, len: usize) {
        if ptr.is_null() {
            return;
        }
        let slice = std::ptr::slice_from_raw_parts_mut(ptr, len);
        drop(unsafe { Box::from_raw(slice) });
    }

    /// Handle one synchronous API request in this WASM instance's workspace.
    /// Response layout: status u16, content-type length u16, body length u32,
    /// followed by content-type and body bytes (all integers little-endian).
    ///
    /// # Safety
    /// The request pointer must address `len` readable bytes in WASM memory.
    #[no_mangle]
    pub unsafe extern "C" fn handle(request_ptr: *const u8, len: usize) -> *mut u8 {
        let request = if len == 0 {
            &[][..]
        } else {
            unsafe { std::slice::from_raw_parts(request_ptr, len) }
        };
        let response = ENGINE.with(|engine| engine.borrow().handle_bytes(request));
        let content_type = response.content_type.as_bytes();
        let total = 8 + content_type.len() + response.body.len();
        let mut bytes = Vec::with_capacity(total);
        bytes.extend_from_slice(&response.status.to_le_bytes());
        bytes.extend_from_slice(&(content_type.len() as u16).to_le_bytes());
        bytes.extend_from_slice(&(response.body.len() as u32).to_le_bytes());
        bytes.extend_from_slice(content_type);
        bytes.extend_from_slice(&response.body);
        Box::into_raw(bytes.into_boxed_slice()) as *mut u8
    }
}
