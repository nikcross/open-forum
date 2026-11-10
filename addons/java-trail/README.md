# Java Trail OpenForum plugin

OpenForum-specific adapter for the independent Java Trail library. Background session management, message queues and `JavaTrailSystemHelper` remain here. The tracing engine and its sample/configuration/design notes have moved to `/home/nik/os-git/java-trail`.

## Build

Requires JDK 11+ for these sources, Maven, and the existing OpenForum server 5.0.9 dependency available in the Maven repository. The server/runtime JDK must also meet OpenForum's own requirements.

```sh
cd /home/nik/os-git/java-trail
mvn clean install
cd /home/nik/os-git/open-forum/addons/java-trail
mvn clean package
```

Artifacts:

- `target/java-trail-openforum-1.6.0.jar`: thin adapter; supply Java Trail and its runtime dependencies separately.
- `target/java-trail-openforum-1.6.0-plugin.jar`: adapter with Java Trail and core dependencies bundled for plugin installation. It deliberately excludes the OpenForum server and its provided dependencies.

Install the `-plugin.jar` using your normal OpenForum plugin workflow. Replace the old combined java-trail JAR rather than leaving both versions on the classpath. No server JAR or page configuration has been changed or deployed by this extraction. Restart/reload using your usual plugin procedure.

## Existing page compatibility

The following Java classes remain at their original names:

- `org.onestonesoup.openforum.javatrail.JavaTrail`: retains `connect(host, port)` and the legacy debugger return type. Existing `/JavaTrail/data.json` API registration is unchanged.
- `org.onestonesoup.openforum.javatrail.SimpleDebugVM`: adapter inheriting debugger operations from the independent engine.
- `org.onestonesoup.openforum.javatrail.JavaTrailCam`: adapter retaining the processing/connect APIs and legacy debugger return types.
- `org.onestonesoup.openforum.javatrail.JavaTrailSystemHelper`: original server API and background-session implementation, including message queues `/Test/JavaTrail` and `/Test/JavaTrailCam`.

Existing OpenForum scripts can continue to call their current methods. Traces/configuration retain their JSON format. The adapters extend the independent library rather than maintaining a second engine implementation. Recompile any external Java integrations when upgrading: nested engine type binary names now belong to `org.onestonesoup.javatrail`, so compatibility is intended for page/script APIs, not arbitrary precompiled consumers.

## Tests

`mvn test` runs the existing helper session/status/stop tests and tests for API registration class names, legacy method return types, inherited debugger operations and JSON error contracts. Engine tests run in the independent project. A library dependency on `org.onestonesoup:java-trail:1.6.0` is required; the standalone executable's `cli` classifier is not used as a library.

Java Trail 1.6.0 adds bounded sessions, reliable debugger cleanup, late-class watches and CLI/offline walkthrough reports. Legacy adapter class and method signatures remain available. See the standalone README for the new options.

The helper reads trace JSON through the standalone codec, preserving commas, brackets, escapes and Unicode in messages. Explicit `failed` results become FAILED sessions; truncated traces retain the compatible COMPLETED state with a partial-data message.
