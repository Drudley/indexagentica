# C++ reflection, UObjects and garbage collection (UE 5.8)

Part of the `unreal-engine-dev` skill. Verified against the Unreal Engine 5.8 documentation on 2026-10-02.

## How reflected code is built

The build runs in two phases. First, UnrealBuildTool (UBT) runs **Unreal Header Tool (UHT)**, which parses headers for `UCLASS`, `USTRUCT`, `UENUM`, `UPROPERTY`, `UFUNCTION` and `UDELEGATE` and generates `*.generated.h` and `*.gen.cpp` code. Then the C++ compiler compiles everything. Many errors in Unreal code therefore come from UHT, before the compiler runs. Read the first UHT error. Later compiler errors are often knock-on effects.

## Header rules UHT enforces

- `#include "MyType.generated.h"` must be the **last** `#include` in the header. Other types can be forward-declared, or included above it.
- Every `UCLASS` and `USTRUCT` body starts with `GENERATED_BODY()`.
- Name prefixes matter, and UHT requires them in most cases: `U` for UObject-derived classes, `A` for AActor-derived classes, `F` for structs and plain classes, `E` for enums, `I` for interfaces, `T` for templates, `S` for Slate widgets. Bools are named `bSomething`.
- UHT understands only a minimal subset of C++. Inside reflected types, it ignores `#if` blocks unless they use `WITH_EDITOR` or `WITH_EDITORONLY_DATA`. Don't hide reflected members behind other macros.
- If a header contains only `DECLARE_DYNAMIC_...` delegates, UBT won't send it to UHT. Put `UDELEGATE` above at least one of them.
- `MYMODULE_API` on a class exports it to other modules. `UCLASS(MinimalAPI)` exports only type information: other modules can cast to the class but can't call its non-inline functions.

## Specifiers you'll use most

`UCLASS(...)`: `Blueprintable` (Blueprints can subclass it; the default is `NotBlueprintable` unless inherited), `BlueprintType` (usable as a Blueprint variable type), `Abstract` (can't be placed in levels), `Config=Game` (the class can store properties in an `.ini` file), `MinimalAPI`.

`UPROPERTY(...)`:

| Specifier | Effect |
|---|---|
| `EditAnywhere` / `EditDefaultsOnly` / `EditInstanceOnly` | Editable in Details panels (on archetypes and instances, defaults only, or instances only) |
| `VisibleAnywhere` / `VisibleDefaultsOnly` | Shown but read-only. Typical for component pointers. Can't be combined with `Edit*` |
| `BlueprintReadOnly` / `BlueprintReadWrite` | Blueprint access. These two are mutually exclusive |
| `Category = "A\|B"` | Groups the property in the editor |
| `Transient` | Not saved. Without it, every `UPROPERTY` is serialized |
| `Config` | Loaded from and saved to the class's `.ini`. Can't have a default set in default properties |
| `Replicated` / `ReplicatedUsing=OnRep_X` | Network replication. You must also register the property in `GetLifetimeReplicatedProps` with `DOREPLIFETIME(ThisClass, Prop)` (include `Net/UnrealNetwork.h`) and enable replication on the actor (`bReplicates = true`) |

`UFUNCTION(...)`:

| Specifier | What you must write |
|---|---|
| `BlueprintCallable` | Callable from Blueprint graphs |
| `BlueprintPure` | No side effects. `const` functions become pure by default, so use `BlueprintPure=false` to opt out. Pure nodes don't cache results |
| `BlueprintImplementableEvent` | Declare only. Blueprint provides the body. Don't define it in C++ |
| `BlueprintNativeEvent` | Define `Foo_Implementation()` in the `.cpp`. Call `Foo()`, which dispatches to the Blueprint override or your implementation |
| `Server` / `Client` / `NetMulticast` with `Reliable` or `Unreliable` | RPC. Define `Foo_Implementation()` |
| `WithValidation` | Also define `bool Foo_Validate(...)` with the same parameters |
| `CallInEditor` | Adds a button to the Details panel for selected instances |
| `Exec` | Console command. Only works in certain classes |

`meta=(...)` metadata exists **only in the editor**. Never write game logic that reads metadata.

To expose static helpers to Blueprint, derive from `UBlueprintFunctionLibrary` and mark the static functions `BlueprintCallable` or `BlueprintPure`.

## Creating UObjects

- UObjects don't support constructor arguments. A default constructor is required, because the engine builds a **Class Default Object (CDO)** from it at startup.
- Keep constructors light: set default values and create subobjects only. Put runtime initialization in `BeginPlay()` for actors and components.
- Create subobjects with `CreateDefaultSubobject<T>(TEXT("Name"))`, in constructors only. Create objects at runtime with `NewObject<T>(Outer)`. To spawn actors, use `UWorld::SpawnActor`.
- **Never** use `new` or `delete` on UObjects. Unreal's smart pointers (`TSharedPtr`, `TSharedRef`, `TWeakPtr`, `TUniquePtr`) don't work with UObjects. Use them only for plain C++ (`F`) types.
- `USTRUCT`s are value types with reflection and serialization, and they aren't garbage collected.
- If you change a default value in the constructor, existing saved instances that still had the old default pick up the new one. Instances whose value was changed keep their value.

## Garbage collection: keep objects alive correctly

The garbage collector traces references from a root set. Only references it can see keep an object alive:

- `UPROPERTY()` object pointers (`TObjectPtr<T>` or `T*`) and `UPROPERTY()` engine containers of them (`TArray<TObjectPtr<T>>`, `TMap`, ...)
- `TStrongObjectPtr<T>` for non-reflected owners
- Actors, which their level references, and components, which their owning actor references

A **raw `UObject*` member without `UPROPERTY`** is invisible to the GC. It doesn't keep the object alive and isn't nulled when the object dies, so it can dangle. If you need a non-owning reference, use `TWeakObjectPtr<T>`: check it with `IsValid()` or `Get()` before use, and it nulls itself when the object is destroyed.

When an actor or component is destroyed, `UPROPERTY` references to it and references in engine containers are **nulled automatically**. Code must handle those pointers becoming null. The same happens when an asset is force-deleted in the editor. Prefer `IsValid(Obj)`, which checks both for null and for garbage, over `Obj != nullptr`.

Destroy actors with `AActor::Destroy()` and components with `DestroyComponent()`. `MarkPendingKill()` was replaced by `MarkAsGarbage()`. Don't use either to force expensive objects to be freed: an object is collected only once all strong references to it are gone.

**`TObjectPtr<T>`**: UE5 introduced it as an optional replacement for raw pointers in `UPROPERTY` members and UObject containers. Epic recommends it for those members. In editor builds it adds access tracking, and in non-editor builds it behaves exactly like a raw pointer. It converts to `T*` implicitly. Use `ToRawPtr()` or `.Get()` where implicit conversion fails, such as in ternaries or `const_cast`. When you capture a `Find()` result from a `TArray<TObjectPtr<T>>`, the return type is `TObjectPtr<T>*`, not `T**`. Function parameters and locals stay `T*`.

## Coding standard highlights (Epic C++ Coding Standard)

- The engine compiles as C++20 by default and requires C++20 at minimum.
- Use `nullptr`, not `NULL`. Mark overrides with `override`.
- Epic's style avoids `auto` except for lambdas and verbose iterator types, and avoids structured bindings. Follow the existing style of the file.
- Wrap string literals in `TEXT("...")`. Use engine types (`TArray`, `TMap`, `TSet`, `FString`, `FName`, `FText`) in reflected code. `std::` containers can't be `UPROPERTY` types.
- Use `Cast<T>(Obj)` and `Obj->IsA<T>()` for runtime type checks. `Cast` returns null on failure. Call the parent implementation with `Super::Function()`.

## Sources

- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-header-tool-for-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/reflection-system-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/objects-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-object-handling-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/class-specifiers
- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-uproperties
- https://dev.epicgames.com/documentation/en-us/unreal-engine/ufunctions-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/replicate-actor-properties-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/smart-pointers-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-5-migration-guide
- https://dev.epicgames.com/documentation/en-us/unreal-engine/epic-cplusplus-coding-standard-for-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/coding-in-unreal-engine-blueprint-vs-cplusplus
