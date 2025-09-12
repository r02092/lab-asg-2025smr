<?php

use Illuminate\Database\Console\Migrations\MigrateMakeCommand;
use Illuminate\Database\Migrations\MigrationCreator;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Composer;
use Illuminate\Support\Facades\Artisan;

Artisan::registerCommand(
    new MigrateMakeCommand(
        new class (new Filesystem(), 'stubs') extends MigrationCreator {
            protected function getDatePrefix()
            {
                return '___';
            }
        },
        new Composer(new Filesystem()),
    ),
);
